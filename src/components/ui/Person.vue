<template>
  <div class="person">
    <UserPicture :avatar="{ picture, username }" :size="40" :showLabel="true" />
    <RouterLink
      :to="{ name: 'Profile', params: { username } }"
      :title="`${firstName} ${lastName}`"
    >
      <div class="person__name-title">
        <div class="person__name">{{ firstName }} {{ lastName }}</div>
        <div class="person__preferred-title">
          <template v-if="title">{{ title }}</template>
          <template v-else-if="funTitle">{{ funTitle }}</template>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script>
import DinoType from './DinoType.vue';
import UserPicture from './UserPicture.vue';

export default {
  name: 'Person',
  props: {
    title: String,
    username: String,
    firstName: String,
    lastName: String,
    officeLocation: String,
    funTitle: String,
    picture: String,
  },
  components: {
    DinoType,
    UserPicture,
  },
};
</script>

<style>
.person {
  border: 1px solid var(--gray-30);
  margin-left: 1em;
  padding: 1em 1.5em;
  position: relative;
  overflow: hidden;
  background-color: var(--white);
}
.person + .person,
.show-more__overflow .person:not(.person--avatar-only):first-child {
  margin-top: 1em;
}
.person__name {
  font-weight: 700;
}
.person__name,
.person__preferred-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.person a {
  color: inherit;
  text-decoration: none;
  overflow: hidden;
}
.person a:hover {
  color: var(--blue-60);
}
.person a::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.focus-styles .person a:focus {
  box-shadow: none;
}
.focus-styles .person a:focus::after {
  box-shadow: var(--focusOutlineShadow);
}
.person__preferred-title {
  color: var(--gray-50);
}
.person__location-label {
  color: var(--gray-50);
}

.person--wide {
  display: grid;
  grid-template-columns: 1.5em 2fr 1fr 1.5em;
  grid-template-rows: 1em auto 1em;
  grid-column-gap: 1em;
}
@supports (display: grid) {
  .person--wide {
    padding: 0; /* with grid support, padding is done by the grid */
  }
}
.person--wide::before {
  grid-column: 1 / 2;
}
.person--wide .person__name-title {
  grid-column-start: 2;
  grid-row-start: 2;
}
.person--wide .person__location {
  grid-column: 3 / -1;
  grid-row: 1 / -1;
}
@supports (display: grid) {
  .person--wide .person__location {
    background-color: var(--gray-10);
    padding: 1em 1.5em;
  }
}

.person--borderless {
  border: 0;
  margin-left: 0;
  padding: 0;
  background-color: transparent;
  display: flex;
}
.person--borderless .user-picture {
  align-self: center;
  margin-right: 1em;
  flex: none;
}
.person--avatar-only {
  display: inline-block;
  vertical-align: top;
  margin-bottom: 1em;
  margin-right: 1em;
}
.person--avatar-only + .person--avatar-only {
  margin-top: 0;
}
.person--avatar-only .person__name-title {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(1px, 1px, 1px, 1px);
  overflow: hidden;
}
.person--avatar-only .user-picture {
  margin-right: 0;
}
</style>
