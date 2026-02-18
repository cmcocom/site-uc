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

interface ImportMetaEnv {
  readonly BANXICO_TOKEN?: string;
}
