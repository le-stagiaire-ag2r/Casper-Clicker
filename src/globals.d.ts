export {};

declare global {
  interface Window {
    config: {
      cspr_click_app_name: string;
      cspr_click_app_id: string;
      cspr_click_providers: string[];
      chain_name: string;
    };
  }
}
