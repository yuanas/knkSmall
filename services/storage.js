const CARDS_KEY = 'credit_cards'

class StorageService {
  // 获取所有卡片
  static async getCards() {
    try {
      const cards = wx.getStorageSync(CARDS_KEY) || []
      return cards.map(card => new Card(card))
    } catch (e) {
      console.error('获取卡片数据失败:', e)
      return []
    }
  }

  // 保存卡片
  static async saveCard(card) {
    try {
      const cards = await this.getCards()
      const index = cards.findIndex(c => c.id === card.id)
      
      if (index >= 0) {
        cards[index] = card
      } else {
        card.id = Date.now().toString() // 简单的ID生成
        cards.push(card)
      }
      
      wx.setStorageSync(CARDS_KEY, cards)
      return card
    } catch (e) {
      console.error('保存卡片失败:', e)
      throw e
    }
  }

  // 删除卡片
  static async deleteCard(cardId) {
    try {
      let cards = await this.getCards()
      cards = cards.filter(card => card.id !== cardId)
      wx.setStorageSync(CARDS_KEY, cards)
    } catch (e) {
      console.error('删除卡片失败:', e)
      throw e
    }
  }
}

export default StorageService 