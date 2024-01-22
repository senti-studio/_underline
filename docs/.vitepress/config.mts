import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  base: '/_underline/',
  title: '_underline UI',
  description: 'Tiny gui for pixijs inspired by DearImGui and CSS',
  themeConfig: {
    logo: '/u_logo.png',
    siteTitle: false,
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Config', link: '/config/' },
      { text: 'Plugins', link: '/plugins/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Why _underline?', link: '/guide/why' },
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Features', link: '/guide/features' },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Config',
          items: [{ text: 'Configure _u', link: '/config/' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/white_paganini' },
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],

    footer: {
      message: 'Made with ❤️ by <a href="https://github.com/pengboomouch">Cristian Cornea</a>',
      copyright: 'Copyright © 2023-present <a href="https://github.com/Tiny-Tales">Tiny Tales Tools</a>',
    },
  },
})
