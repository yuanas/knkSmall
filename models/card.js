class Card {
  constructor(data = {}) {
    this.id = data.id || '';
    this.cardNumber = data.cardNumber || '';
    this.bankName = data.bankName || '';
    this.customName = data.customName || '';
    this.cardType = data.cardType || '';
    this.creditLimit = data.creditLimit || 0;
    this.annualFee = data.annualFee || 0;
    this.billingDay = data.billingDay || 1; // 账单日
    this.paymentDueDay = data.paymentDueDay || 1; // 还款日
    this.notes = data.notes || '';
    this.notifications = {
      billingDayReminder: data.notifications?.billingDayReminder || false,
      paymentDueReminder: data.notifications?.paymentDueReminder || false
    };
  }

  // 计算距离出账日还有多少天
  getDaysToBillingDate() {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // 获取本月账单日
    let billingDate = new Date(currentYear, currentMonth, this.billingDay)
    
    // 如果本月账单日已过，计算下月账单日
    if (today > billingDate) {
      billingDate = new Date(currentYear, currentMonth + 1, this.billingDay)
    }
    
    return Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24))
  }

  // 计算距离还款日还有多少天
  getDaysToPaymentDue() {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // 获取本月还款日
    let dueDate = new Date(currentYear, currentMonth, this.paymentDueDay)
    
    // 如果本月还款日已过，计算下月还款日
    if (today > dueDate) {
      dueDate = new Date(currentYear, currentMonth + 1, this.paymentDueDay)
    }
    
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  }

  // 计算免息天数
  getInterestFreeDays() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // 获取本月账单日
    const billingDate = new Date(currentYear, currentMonth, this.billingDay);

    // 获取本月还款日
    let dueDate = new Date(currentYear, currentMonth, this.paymentDueDay);

    // 如果还款日在账单日之前，说明是下个月的还款日
    if (dueDate < billingDate) {
      dueDate = new Date(currentYear, currentMonth + 1, this.paymentDueDay);
    }

    // 计算两个日期之间的天数差
    const timeDiff = dueDate.getTime() - billingDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
}

export default Card;
