import Card from '../../models/card'
import StorageService from '../../services/storage'

const db = wx.cloud.database()

Page({
  data: {
    cardList: [],
    filteredCardList: [],
    sortOptions: ['账单日期', '还款日期', '待还款金额', '免息天数'],
    sortIndex: 0,
    dayRange: 30,
    dayRangeIndex: 2, // Default to 30 days
    interestFreeDays: 0,
    dayOptions: Array.from({length: 30}, (_, i) => ({
      label: `${i + 1}天`,
      value: i + 1
    })),
    repaymentCount: 0,
    retryCount: 0,
    isAuth: false,
    userInfo: null
  },
  
  onLoad: function() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        isAuth: true,
        userInfo: app.globalData.userInfo
      })
      this.loadCardList()
    }
  },

  getUserInfo: async function() {
    try {
      const userProfile = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      const userInfo = userProfile.userInfo
      this.setData({
        userInfo: userInfo,
        isAuth: true
      })
      
      const app = getApp()
      app.globalData.userInfo = userInfo
      app.globalData.isAuth = true
      
      this.loadCardList()
    } catch (err) {
      console.error('获取用户信息失败：', err)
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  },

  onGetUserInfo: function() {
    this.getUserInfo()
  },
  
  onShow: function() {
    if (!wx.cloud) {
      wx.showToast({
        title: '请使用 2.2.3 或以上的基础库以使用云能力',
        icon: 'none'
      })
      return
    }
    if (this.data.isAuth) {
      this.loadCardList()
    }
  },
  
  loadCardList: function() {
    const app = getApp()
    console.log('当前openid:', app.globalData.openid)
    
    if (!app.globalData.openid) {
      if (!this.retryCount) {
        this.retryCount = 0
      }
      
      if (this.retryCount >= 3) {
        console.error('重试次数已达上限')
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
        return
      }

      console.log(`第${this.retryCount + 1}次重试获取openid`)
      this.retryCount++
      wx.showToast({
        title: `第${this.retryCount}次尝试获取用户`,
        icon: 'loading',
        duration: 1000
      })
      setTimeout(() => {
        this.loadCardList()
      }, 1000)
      return
    }

    this.retryCount = 0

    wx.showLoading({
      title: '加载中...'
    })
    
    const db = wx.cloud.database()
    console.log('开始查询卡片列表')
    db.collection('cards')
      .where({
        _openid: app.globalData.openid
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        console.log('查询结果:', res.data)
        const processedData = res.data.map(item => {
          const card = new Card(item)
          return {
            ...item,
            currentBill: item.currentBill || 0,
            totalLimit: item.totalLimit || 0,
            availableLimit: item.availableLimit || 0,
            daysToBilling: card.getDaysToBillingDate(),
            daysToPayment: card.getDaysToPaymentDue(),
            interestFreeDays: card.getInterestFreeDays(),
            bankName: item.bankName || '',
            customName: item.customName || '',
            cardType: item.cardType || '',
            notifications: {
              ...item.notifications,
              limitAlert: item.notifications?.limitAlert || false,
              largeAmountAlert: item.notifications?.largeAmountAlert || false
            }
          }
        })
        
        wx.hideLoading()
        this.setData({
          cardList: processedData
        })
        this.filterAndSortCards()
      })
      .catch(err => {
        console.error('查询失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
  },

  onSortChange(e) {
    const sortIndex = e.detail.value
    this.setData({ sortIndex })
    this.filterAndSortCards()
  },

  onDayRangeChange(e) {
    const index = e.detail.value
    const value = this.data.dayOptions[index].value
    this.setData({ 
      dayRange: value,
      dayRangeIndex: index
    })
    this.filterAndSortCards()
  },

  filterAndSortCards() {
    const { cardList, dayRange } = this.data
    const filteredCards = cardList.filter(card => card.daysToPayment <= dayRange)
    
    const repaymentCount = filteredCards.reduce((count, card) => {
      return count + (card.currentBill > 0 ? 1 : 0)
    }, 0)
    
    this.sortCards(filteredCards)
    this.setData({
      filteredCardList: filteredCards,
      repaymentCount
    })
  },

  sortCards(cards) {
    const { sortIndex } = this.data
    switch (sortIndex) {
      case 0: // 按账单日排序
        cards.sort((a, b) => a.daysToBilling - b.daysToBilling)
        break
      case 1: // 按还款日排序
        cards.sort((a, b) => a.daysToPayment - b.daysToPayment)
        break
      case 2: // 按待还款金额排序
        cards.sort((a, b) => b.currentBill - a.currentBill)
        break
      case 3: // 按免息天数排序
        cards.sort((a, b) => b.interestFreeDays - a.interestFreeDays)
        break
      default:
        break
    }
  },

  onAddCard() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    })
  },

  onCardTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}`
    })
  }
})
