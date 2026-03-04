import { z } from 'zod';
import { insertOrderSchema, insertAccuratePaymentSchema, insertBonusPaymentSchema, users, orders, accuratePayments, bonusPayments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.extend({ amount: z.coerce.number() }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/orders/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  accuratePayments: {
    list: {
      method: 'GET' as const,
      path: '/api/accurate-payments' as const,
      responses: {
        200: z.array(z.custom<typeof accuratePayments.$inferSelect>()),
      },
    },
    createOrUpdate: {
      method: 'POST' as const,
      path: '/api/accurate-payments' as const,
      input: insertAccuratePaymentSchema.extend({ amount: z.coerce.number() }),
      responses: {
        200: z.custom<typeof accuratePayments.$inferSelect>(),
        201: z.custom<typeof accuratePayments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  bonusPayments: {
    list: {
      method: 'GET' as const,
      path: '/api/bonus-payments' as const,
      responses: {
        200: z.array(z.custom<typeof bonusPayments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bonus-payments' as const,
      input: insertBonusPaymentSchema.extend({ amount: z.coerce.number() }),
      responses: {
        201: z.custom<typeof bonusPayments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const ws = {
  receive: {
    update: z.object({
      type: z.enum(['order', 'accurate_payment', 'bonus_payment']),
      action: z.enum(['create', 'update', 'delete']),
      payload: z.any()
    })
  }
};

export type AuthMeResponse = z.infer<typeof api.auth.me.responses[200]>;
export type OrderResponse = z.infer<typeof api.orders.create.responses[201]>;
export type OrdersListResponse = z.infer<typeof api.orders.list.responses[200]>;
export type AccuratePaymentResponse = z.infer<typeof api.accuratePayments.createOrUpdate.responses[200]>;
export type BonusPaymentResponse = z.infer<typeof api.bonusPayments.create.responses[201]>;
