/* GMAIL */
export type GmailAlertServiceConfig = {
  auth: {
    user: string;
    pass: string;
  };
  to: string[];
};

export type GmailAlertServicePayload = {
  subject: string;
  content: string;
};

/* SIGNAL */
export type SignalAlertServiceConfig = {
  auth: string;
};

export type SignalAlertServicePayload = {
  content: string;
}

/* TELEGRAM */
export type TelegramAlertServiceConfig = {
  auth: string;
}

export type TelegramAlertServicePayload = {
  content: string;
}

/* GENERAL */
export type BuiltinAlertServicesPayloads = {
  gmail: GmailAlertServicePayload;
  telegram: TelegramAlertServicePayload;
  signal: SignalAlertServicePayload;
}
export type BuiltinAlertServicesConfigs = {
  gmail: GmailAlertServiceConfig;
  telegram: TelegramAlertServiceConfig;
  signal: SignalAlertServiceConfig;
}

export type BuiltinAlertServices = Extract<keyof BuiltinAlertServicesPayloads, keyof BuiltinAlertServicesConfigs>
