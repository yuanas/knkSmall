const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  try {
    console.log('开始获取用户信息')
    const wxContext = cloud.getWXContext()
    console.log('wxContext:', wxContext)
    
    if (!wxContext.OPENID) {
      console.error('未能获取到OPENID')
      throw new Error('无法获取用户OPENID')
    }

    const result = {
      success: true,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
    console.log('返回结果:', result)
    return result
  } catch (err) {
    console.error('[云函数] [login] 调用失败：', err)
    return {
      success: false,
      error: err.message
    }
  }
} 