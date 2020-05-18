export const state = function() {
    return {
        host: '',
        path: '',
        ts: 0,
        sortby: 's', // s or fc
        show: 'all', // all or variation
        display: 'stack', // stack or line
        history_min: 0
    }
}

export const mutations = {
    setHost (state, host) {
        state.host = host;
        state.path = ''; // reset path on host change
        state.ts = 0; // reset ts on host change
        state.history_min = 0;
        location.href='#'+JSON.stringify({host: state.host, path: state.path, ts: state.ts})
    },
    setPath (state, path) {
        if (path == '..') {
            var current_path=state.path
            state.path = current_path.split('/').slice(0,-1).join('/')
        } else {
            state.path = path;
        }
        location.href='#'+JSON.stringify({host: state.host, path: state.path, ts: state.ts})
    },
    setTimestamp (state, ts) {
        state.ts = ts;
        location.href='#'+JSON.stringify({host: state.host, path: state.path, ts: state.ts})
    },
    setSortby (state, sortby) {
        state.sortby = sortby;
    },
    setShow (state, show) {
        state.show = show;
    },
    setDisplay (state, display) {
        state.display = display;
    },
    setHistoryMin (state, value) {
        state.history_min = value;
    },
}

