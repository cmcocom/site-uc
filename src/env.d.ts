/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        BANXICO_TOKEN?: string;
      };
    };
  }
}
