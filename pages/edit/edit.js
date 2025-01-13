import Card from '../../models/card'
import StorageService from '../../services/storage'

const db = wx.cloud.database()

Page({
  data: {
    card: null,
    days: Array.from({length: 31}, (_, i) => i + 1),
    isNew: true
  },

  async onLoad(options) {
    if (options.id) {
      try {
        // 从云数据库获取卡片数据
        const db = wx.cloud.database()
        const result = await db.collection('cards').doc(options.id).get()
        
        if (result.data) {
          this.setData({
            card: result.data,
            isNew: false
          })
        } else {
          // 如果找不到数据，创建新卡片
          this.initNewCard()
        }
      } catch (err) {
        console.error('获取卡片数据失败:', err)
        // 发生错误时也创建新卡片
        this.initNewCard()
      }
    } else {
      this.initNewCard()
    }
  },

  // 初始化新卡片
  initNewCard() {
    this.setData({
      card: {
        cardName: '',
        cardNumber: '',
        billingDay: 1,
        paymentDueDay: 1,
        notifications: {
          billingDayReminder: false,
          paymentDueReminder: false
        }
      },
      isNew: true
    })
  },

  async onSubmit(e) {
    const formData = e.detail.value
    const cardData = {
      cardName: formData.cardName,
      cardNumber: formData.cardNumber,
      billingDay: parseInt(formData.billingDay) + 1,
      paymentDueDay: parseInt(formData.paymentDueDay) + 1,
      currentBill: 0, // 初始账单金额
      totalLimit: formData.totalLimit || 0, // 总额度
      availableLimit: formData.totalLimit || 0, // 可用额度
      notifications: {
        billingDayReminder: formData.billingDayReminder,
        paymentDueReminder: formData.paymentDueReminder,
        limitAlert: formData.limitAlert || false, // 额度提醒
        largeAmountAlert: formData.largeAmountAlert || false // 大额消费提醒
      },
      additionalInfo: {
        bankName: formData.bankName || '', // 银行名称
        cardType: formData.cardType || '', // 卡片类型
        customName: formData.customName || '' // 自定义名称
      }
    }

    try {
      const db = wx.cloud.database()
      if (this.data.isNew) {
        // 新建卡片
        const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        await db.collection('cards').add({
          data: {
            // _openid: id,
            ...cardData,
            createTime: new Date()
          }
        })
      } else {
        // 更新现有卡片
        await db.collection('cards').doc(this.data.card._id).update({
          data: cardData
        })
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      wx.navigateBack()
    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  async onDelete() {
    if (this.data.isNew) return
    
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这张卡片吗？'
      })
      
      if (res.confirm) {
        const db = wx.cloud.database()
        await db.collection('cards').doc(this.data.card._id).remove()
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        wx.navigateBack()
      }
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }
})
