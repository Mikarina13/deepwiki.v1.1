import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        activity: resolve(__dirname, 'activity.html'),
        browseArchive: resolve(__dirname, 'browse-archive.html'),
        browseCollab: resolve(__dirname, 'browse-collab.html'),
        collab: resolve(__dirname, 'collab.html'),
        contact: resolve(__dirname, 'contact.html'),
        favorites: resolve(__dirname, 'favorites.html'),
        help: resolve(__dirname, 'help.html'),
        infoHub: resolve(__dirname, 'info-hub.html'),
        login: resolve(__dirname, 'login.html'),
        profile: resolve(__dirname, 'profile.html'),
        publish: resolve(__dirname, 'publish.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
        settings: resolve(__dirname, 'settings.html'),
        support: resolve(__dirname, 'support.html'),
        viewPost: resolve(__dirname, 'view-post.html'),
      },
    },
  },
})
