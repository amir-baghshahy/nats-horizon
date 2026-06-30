/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlertCondition } from './AlertCondition';
import type { Duration } from './Duration';
export type Alert = {
    /**
     * Notification channels: "email", "webhook", "slack"
     */
    channels?: Array<string>;
    condition?: AlertCondition;
    cooldown?: Duration;
    created_at?: string;
    description?: string;
    /**
     * Email address for email notifications
     */
    email_address?: string;
    enabled?: boolean;
    id?: string;
    last_trigger?: string;
    name?: string;
    severity?: string;
    /**
     * Slack webhook URL for Slack notifications
     */
    slack_webhook_url?: string;
    trigger_count?: number;
    updated_at?: string;
    /**
     * Webhook URL for webhook notifications
     */
    webhook_url?: string;
};

