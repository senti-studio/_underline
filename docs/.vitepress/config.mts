import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '_underline UI',
  base: '/_underline/',
  description: 'Tiny gui for pixijs inspired by DearImGui and CSS',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Plugins', link: '/plugins' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

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
