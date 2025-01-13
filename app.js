App({
  onLaunch: async function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    wx.cloud.init({
      env: 'cards-7g4hrrjw7bca8cf8',
      traceUser: true
    })

    // 等待云函数初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    await this.initCloud()
  },

  async initCloud() {
    try {
      console.log('开始调用login云函数')
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      })
      console.log('login云函数返回结果:', result)
      
      if (result && result.success && result.openid) {
        this.globalData.openid = result.openid
        console.log('获取openid成功:', result.openid)
      } else {
        console.error('login云函数返回异常:', result)
        throw new Error(result?.error || '获取openid失败')
      }
    } catch (err) {
      console.error('获取用户openid失败：', err)
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
  globalData: {
    openid: null,
    userInfo: null,
    isAuth: false
  }
}) 