import Vue from 'vue';
import Vuex from 'vuex';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';
import { oidcSettings } from '../../config/oidc';
import { $http } from '../axios/http';
import { $ReferenceService } from '../../services/reference.service';
// import { WebStorageStateStore } from 'oidc-client'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    oidcStore: vuexOidcCreateStoreModule(
      oidcSettings,
      // {
      //   ...oidcSettings,
      //   userStore: new WebStorageStateStore({ store: window.sessionStorage })
      // },
      {
        namespaced: true,
        dispatchEventsOnWindow: true
      },
      {
        userLoaded: user => {
          $http.defaults.headers.common['Authorization'] =
            'Bearer ' + user.access_token;
        },
        userUnloaded: () => {},
        accessTokenExpiring: () => {},
        accessTokenExpired: () => {},
        silentRenewError: () => {},
        userSignedOut: () => {},
        oidcError: payload => {},
        automaticSilentRenewError: payload => {}
      }
    ),

    referenceStore: {
      state: {
        references: new Map(),
        referencesLoaded: false
      },

      actions: {
        loadAllReferences({ commit }) {
          $ReferenceService.getAll().then(response => {
            commit('allReferencesLoaded', response.data);
          });
        },

        loadReference({ commit }, type) {
          $ReferenceService.getReference(type).then(response => {
            commit('referenceLoaded', type, response.data);
          });
        }
      },

      mutations: {
        allReferencesLoaded(state, references) {
          if (Array.isArray(references)) {
            references.forEach(reference => {
              const refsByType = state.references.get(reference.type.name);
              if (!Array.isArray(refsByType)) {
                // иначе мапа не реактивная
                state.references = new Map(
                  state.references.set(reference.type.name, [reference])
                );
              } else {
                refsByType.push(reference);
                // иначе мапа не реактивная
                state.references = new Map(state.references);
              }
            });
          }
          state.referencesLoaded = true;
        },
        referenceLoaded(state, type, references) {
          state.references.set(type, references);
          // иначе мапа не реактивная
          state.references = new Map(state.references);
          state.referencesLoaded = true;
        }
      }
    },

    systemMessages: {
      namespaced: true,

      actions: {
        addMessage({ commit }, message) {
          commit('addSystemMessage', {
            type: '',
            text: message,
            date: new Date()
          });
        },

        addInfo({ commit }, message) {
          commit('addSystemMessage', {
            type: 'info',
            text: message,
            date: new Date()
          });
        },

        addSuccess({ commit }, message) {
          commit('addSystemMessage', {
            type: 'success',
            text: message,
            date: new Date()
          });
        },

        addError({ commit }, message) {
          commit('addSystemMessage', {
            type: 'error',
            text: message,
            date: new Date()
          });
        },

        addWarning({ commit }, message) {
          commit('addSystemMessage', {
            type: 'warning',
            text: message,
            date: new Date()
          });
        }
      },

      mutations: {
        addSystemMessage(state, message) {
          state.messages.push(message);

          setTimeout(() => {
            state.messages.shift();
          }, 3000);
        }
      },

      state: {
        messages: []
      },

      getters: {
        messages: state => state.messages
      }
    },

    validationStore: {
      state: {
        validationEnabled: false
      },

      actions: {
        validationEnabled({ commit }) {
          commit('validationEnabled');
        },

        validationReset({ commit }) {
          commit('validationReset');
        }
      },

      mutations: {
        validationEnabled(state) {
          state.validationEnabled = true;
        },

        validationReset(state) {
          state.validationEnabled = false;
        }
      }
    }
  }
});
