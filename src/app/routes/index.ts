import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';

import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import paymentRouter from '../modules/payment/payment.route';
// import walletRouter from '../modules/wallet/wallet.route';
import withdrawRouter from '../modules/withdraw/withdraw.route';
import reviewRouter from '../modules/ratings/ratings.route';
import faqRouter from '../modules/faq/faq.route';
import propertyRouter from '../modules/property/property.route';
import invitePeopleRouter from '../modules/invitePeople/invitePeople.route';
import agreementRouter from '../modules/agreement/agreement.route';
import announcementsRouter from '../modules/announcements/announcements.route';
import maintenanceRouter from '../modules/maintenance/maintenance.route';
import adminAnnouncementsRouter from '../modules/admin.announcements/admin.announcements.route';
import chatRouter from '../modules/chat/chat.route';
import messageRouter from '../modules/message/message.route';
import offlinePaymentRouter from '../offlinePayment/offlinePayment.route';
import rentDueRouter from '../modules/rentDue/rentDue.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/setting',
    route: settingsRouter,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  // {
  //   path: '/wallet',
  //   route: walletRouter,
  // },
  {
    path: '/payment',
    route: paymentRouter,
  },
  {
    path: '/withdraw',
    route: withdrawRouter,
  },

  {
    path: '/review',
    route: reviewRouter,
  },
  {
    path: '/chat',
    route: chatRouter,
  },
  {
    path: '/message',
    route: messageRouter,
  },
  {
    path: '/faq',
    route: faqRouter,
  },
  {
    path: '/property',
    route: propertyRouter,
  },
  {
    path: '/invite-people',
    route: invitePeopleRouter,
  },
  {
    path: '/agreement',
    route: agreementRouter,
  },
  {
    path: '/announcement',
    route: announcementsRouter,
  },
  {
    path: '/maintenance',
    route: maintenanceRouter,
  },
  {
    path: '/admin-announcement',
    route: adminAnnouncementsRouter,
  },
  {
    path: '/offline-payment',
    route: offlinePaymentRouter,
  },
  {
    path: '/rent-due',
    route: rentDueRouter,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
