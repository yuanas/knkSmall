import Card from '../../models/card'
import StorageService from '../../services/storage'

Page({
  data: {
    sortedCards: []
  },

  onLoad() {
    this.loadCardList()
  },

  loadCardList() {
    const app = getApp()
    wx.showLoading({ title: '加载中...' })

    wx.cloud.database().collection('cards')
      .where({ _openid: app.globalData.openid })
      .get()
      .then(res => {
        const cards = res.data.map(item => {
          const card = new Card(item)
          return {
            ...item,
            daysToBilling: card.getDaysToBillingDate(),
            daysToPayment: card.getDaysToPaymentDue(),
            interestFreeDays: card.getInterestFreeDays()
          }
        })

        // 按免息期从长到短排序
        cards.sort((a, b) => b.interestFreeDays - a.interestFreeDays)

        this.setData({ sortedCards: cards })
        wx.hideLoading()
      })
      .catch(err => {
        console.error('加载卡片失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
  }
})
