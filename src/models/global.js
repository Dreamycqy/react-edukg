export default {
  namespace: 'global',
  state: {
    locale: 'cn',
    userName: '',
    userConfig: {},
    email: '',
  },
  reducers: {
    save(state, { payload: { userInfo = {} } }) {
      return { ...state, userInfo }
    },
    updateState: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
}
