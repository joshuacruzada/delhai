export const generateNotifications = (stockArray, category) => {
    return stockArray.map((stock, index) => ({
      id: index,
      message: `Stock item ${stock.name} in category ${category} is low.`,
      time: new Date().toLocaleString(),
      read: false,
      icon: 'low-stock-icon' // Replace with the actual icon class you use
    }));
  };
  
  // Function to load notifications from local storage or another storage mechanism
  export const loadNotifications = () => {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  };
  
  // Function to mark a notification as read
  export const markNotificationAsRead = (id) => {
    let notifications = loadNotifications();
    notifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    saveNotifications(notifications);
    return notifications;
  };
  
  // Function to save notifications to local storage or another storage mechanism
  export const saveNotifications = (notifications) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };
  