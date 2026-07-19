/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConsumerConfigResponse } from "./ConsumerConfigResponse";
export type ConsumerResponse = {
  ack_rate?: string;
  config?: ConsumerConfigResponse;
  durable_name?: string;
  filter_subject?: string;
  lag?: number;
  name?: string;
  num_pending?: number;
  paused?: boolean;
  status?: string;
  stream?: string;
};
