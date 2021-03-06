<template>
  <section class="edit-invitations-container">
    <AccessGroupEditPanel
      :title="
        `${fluent(
          'access-group_pending-invitations',
        )} (${totalInvitationsAndRequests})`
      "
      :full="true"
    >
      <template v-slot:content>
        <AccessGroupMembersTable
          :data="groupInvitations"
          :columns="invitationColumns"
          :showHeaders="false"
        >
          <div slot="row-confirm" slot-scope="{ member }">
            <p class="leave-confirm__description">
              {{ fluent('access-group_members', 'remove-confirm') }}
            </p>
            <Button
              class="primary-button"
              @click="handleRemoveConfirmClick(member)"
              >{{ fluent('access-group_members', 'remove-action') }}</Button
            >
            <Button
              class="secondary-button"
              @click="handleCancelClick(member)"
              >{{ fluent('access-group_members', 'remove-cancel') }}</Button
            >
          </div>
          <div
            slot="row-actions"
            slot-scope="{ member }"
            class="pending-invitations-container__actions"
          >
            <Button
              class="tertiary-action delete"
              @click="handleRemoveClicked(member)"
            >
              <Icon id="x" :width="16" :height="16" />
            </Button>
          </div>
        </AccessGroupMembersTable>
      </template>
    </AccessGroupEditPanel>
    <AccessGroupEditPanel :title="fluent('access-group_invite-member')">
      <template v-slot:content>
        <div class="members-invite-container tags-selector">
          <TagSelector
            class="tags-selector__value"
            v-model="newInvites"
            :getLabel="getTagLabel"
            :updateAutoComplete="updateAutoCompleteList"
          />
          <p class="tags-selector__description">
            {{
              fluent('access-group_invite-member', 'tags-selector__description')
            }}
          </p>
          <div class="content-area__row invite-expiration">
            <div class="radio-control invite-expiration__toggle">
              <input type="checkbox" v-model="newInvitesExpirationEnabled" />
              {{
                fluent(
                  'access-group_invite-member',
                  'invite-expiration__toggle',
                )
              }}
            </div>
          </div>
          <div class="expiration-container" v-if="newInvitesExpirationEnabled">
            <label class="expiration-container__label">
              {{
                fluent('access-group_invite-member', 'invite-expiration__label')
              }}
            </label>
            <RadioSelect
              class="expiration-container__value"
              :options="expirationOptions"
              v-model="newInvitesExpiration"
              :isCustom="isExpirationCustom"
            />
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button
          :disabled="!newInvitesDirty"
          class="button--secondary button--action row-primary-action"
          @click="handleAddNewInvitesClicked()"
          >{{ fluent('access-group_invite-member', 'invite') }}</Button
        >
      </template>
    </AccessGroupEditPanel>
    <AccessGroupEditPanel
      :title="fluent('access-group_email-invite-text')"
      v-if="getFeature('customInvitationText')"
    >
      <template v-slot:content>
        <div class="members-expiration-container">
          <div class="content-area__row">
            <div class="radio-control">
              <input type="checkbox" v-model="emailInviteTextEnabled" />
              {{ fluent('access-group_email-invite-text', 'checkbox') }}
            </div>
          </div>
        </div>
        <div class="content-area__row multi-line" v-if="emailInviteTextEnabled">
          <label class="content-area__label">
            {{ fluent('access-group_email-invite-text', 'description') }}
          </label>
          <TextArea
            :rows="5"
            :maxlength="5000"
            v-model="emailInviteText"
            class="content-area__value"
          ></TextArea>
        </div>
      </template>
      <template v-slot:footer>
        <Button
          :disabled="!emailInviteTextDirty"
          @click="handleUpdateInviteTextClicked"
          class="button--secondary button--action row-primary-action"
        >
          {{ fluent('access-group_email-invite-text', 'update-invite-text') }}
        </Button>
      </template>
    </AccessGroupEditPanel>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TextInput from '@/components/ui/TextInput.vue';
import TextArea from '@/components/ui/TextArea.vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import SelectCustom from '@/components/ui/SelectCustom.vue';
import RadioSelect from '@/components/ui/RadioSelect.vue';
import AccessGroupEditPanel from '@/components/access_group/AccessGroupEditPanel.vue';
import TagSelector from '@/components/ui/TagSelector.vue';
import AccessGroups from '@/assets/js/access-groups';
import {
  DisplayMemberViewModel,
  MEMBER_EXPIRATION_NONE,
  MEMBER_EXPIRATION_ONE_YEAR,
  MEMBER_EXPIRATION_TWO_YEARS,
} from '@/view_models/AccessGroupViewModel';
import AccessGroupMemberListDisplay from '@/components/access_group/AccessGroupMemberListDisplay.vue';
import AccessGroupMembersTable from '@/components/access_group/AccessGroupMembersTable.vue';
import { expiryText } from '@/assets/js/component-utils';

export default {
  name: 'AccessGroupInvitationsEdit',
  components: {
    TextInput,
    TextArea,
    Button,
    Icon,
    AccessGroupEditPanel,
    TagSelector,
    AccessGroupMemberListDisplay,
    AccessGroupMembersTable,
    SelectCustom,
    RadioSelect,
  },
  props: [],
  mounted() {},
  data() {
    const invitationConfig = this.$store.getters[
      'accessGroup/getInvitationConfig'
    ];
    const groupExpiration = this.$store.getters['accessGroup/getExpiration'];
    return {
      newInvites: [],
      newInvitesDirty: false,
      emailInviteTextEnabled: invitationConfig !== null,
      emailInviteText: invitationConfig,
      emailInviteTextDirty: false,
      newInvitesExpirationEnabled: false,
      newInvitesExpiration: groupExpiration,
      expirationOptions: [
        {
          label: this.fluent('access-group_expiration', 'one-year'),
          value: MEMBER_EXPIRATION_ONE_YEAR,
        },
        {
          label: this.fluent('access-group_expiration', 'two-years'),
          value: MEMBER_EXPIRATION_TWO_YEARS,
        },
        {
          label: this.fluent('access-group_expiration', 'no-expire'),
          value: MEMBER_EXPIRATION_NONE,
        },
        {
          label: this.fluent('access-group_expiration', 'custom'),
          value: 'custom',
        },
      ],
      invitationColumns: [
        {
          header: null,
        },
        {
          header: null,
          // TODO: This should be either invitation or request once request happens
          contentHandler: (member) => 'Invitation',
        },
        {
          header: null,
          contentHandler: (member) =>
            `${this.fluent(
              'access-group_invite-member',
              'table-row-text',
            )} ${this.expiry(member.expiration)}`,
        },
        {
          header: null,
        },
      ],
    };
  },
  watch: {
    newInvites(value) {
      if (value.length > 0) {
        this.newInvitesDirty = true;
      }
    },
    emailInviteTextEnabled(value) {
      this.emailInviteTextDirty = true;
    },
    emailInviteText(value) {
      this.emailInviteTextDirty = true;
    },
  },
  methods: {
    ...mapActions({
      resendInvitation: 'accessGroup/resendInvitation',
      deleteInvitation: 'accessGroup/deleteInvitation',
      sendInvitations: 'accessGroup/sendInvitations',
      updateInviteText: 'accessGroup/updateInviteText',
    }),
    expiry(expiration) {
      return expiryText(this.fluent, expiration);
    },
    isExpirationCustom(optionValue) {
      return optionValue === 'custom';
    },
    handleResendClicked(invitation) {
      this.resendInvitation(invitation).then((result) => {
        this.tinyNotification('access-group-invite-email-resent');
      });
    },
    handleRemoveClicked(invitation) {
      this.deleteInvitation(invitation).then((result) => {
        this.tinyNotification('access-group-invite-deleted');
      });
    },
    getTagLabel(curator) {
      return curator.displayName;
    },
    updateAutoCompleteList(search) {
      return new Promise((res, rej) => {
        AccessGroups.getUsers(search, this.groupName).then((results) => {
          res(
            results.map((profile) =>
              DisplayMemberViewModel.fromUserData(profile),
            ),
          );
        });
      });
    },
    handleAddNewInvitesClicked() {
      this.sendInvitations({
        invites: this.newInvites,
        expiration: this.newInvitesExpiration,
      }).then((result) => {
        this.tinyNotification('access-group-members-invite-success');
        this.newInvites = [];
        this.newInvitesDirty = false;
      });
    },
    handleUpdateInviteTextClicked() {
      this.updateInviteText(this.newInvites).then((result) => {
        this.tinyNotification('access-group-invitation-text-updated');
        this.emailInviteTextDirty = false;
      });
    },
  },
  computed: {
    ...mapGetters({
      groupName: 'accessGroup/getGroupName',
      groupExpiration: 'accessGroup/getExpiration',
      groupInvitations: 'accessGroup/getInvitations',
      groupRequests: 'accessGroup/getRequests',
    }),
    // TODO: Eventually include request numbers in this number
    totalInvitationsAndRequests() {
      return this.groupInvitations.length;
    },
  },
};
</script>

<style>
.edit-invitations-container {
  /* enable tag selector dropdown */
  overflow: visible;
}

.pending-invitations-container {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.pending-invitations-container .pending-invitations-container__item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.pending-invitations-container
  .pending-invitations-container__item:nth-child(odd) {
  background: var(--gray-20);
}

.pending-invitations-container__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.pending-invitations-container__actions .secondary-button {
  border: 1px solid var(--gray-60);
  color: var(--gray-60);
  padding-top: 0.25em;
  padding-bottom: 0.25em;
  height: 2em;
  background: var(--white);
}

.pending-invitations-container__actions .tertiary-action {
  border: none;
  background: none;
  color: #ff0039;
  padding-right: 0;
  display: inline-block;
  margin-right: 1em;
}

.content-area__row.multi-line .content-area__value {
  width: 100%;
  margin-top: 1em;
}

.tags-selector .tags-selector__description {
  color: var(--gray-40);
}

/* .new-invites-expiration {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.new-invites-expiration .new-invites-expiration__label {
  color: var(--gray-40);
  margin-bottom: 1em;
}

.new-invites-expiration .new-invites-expiration__value {
  width: 100%;
} */
</style>
