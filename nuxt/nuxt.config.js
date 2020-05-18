module.exports = {
    mode: 'universal',
    server: {
        host: '0.0.0.0'
    },
    head: {
        title: 'DiskReport',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'online disk space usage report tool' }
        ],
        link: [
            { rel: 'icon', type: 'image/png', href: '/img/diskreport-2x.png' }
        ],
        script: [
        ]
    },
    plugins: [
        {src: '~plugins/vue-select', mode: 'client'},
        {src: '~plugins/vue-echarts', mode: 'client'},
        {src: '~plugins/vue-gallery.client.js', mode: 'client'},
        {src: '~plugins/vue-shortkey.client.js', mode: 'client'},
        {src: '~plugins/diskreport'}
    ],
    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/auth',
        'bootstrap-vue/nuxt'
    ],
    axios: {
        baseURL: process.env.BACKEND_URL,
        proxy: true
    },
    proxy: {
        '/api/': process.env.BACKEND_URL
    },
    auth: {
        strategies: {
            local: {
                endpoints: {
                    login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
                    logout: { url: '/api/auth/logout', method: 'post' },
                    user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
                },
            }
        },
        redirect: {
            login: '/user/login',
            home: '/',
            logout: '/',
        }
    },
    build: {
        extend (config, { isClient }) {
            if (isClient) {
            }
        },
        // https://www.npmjs.com/package/vue-echarts#usage
        transpile: ['vue-echarts', 'resize-detector']
    }
}

