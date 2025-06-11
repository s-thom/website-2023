import type { AstroConfig, AstroIntegrationLogger } from "astro";

const SLOW_WARNING_TIMEOUT = 3000;

export interface BaseCustomHookPayload {
  logger: AstroIntegrationLogger;
}

export async function runCustomIntegrationHook<
  K extends keyof Astro.IntegrationHooks,
>(
  astroConfig: AstroConfig,
  logger: AstroIntegrationLogger,
  key: K,
  payload: Omit<Parameters<Astro.IntegrationHooks[K]>[0], "logger">,
): Promise<void> {
  for (const integration of astroConfig.integrations) {
    const hook = integration.hooks[key];
    if (!hook) {
      continue;
    }

    const startTime = performance.now();
    let wasSlow = false;
    const timeout = setTimeout(() => {
      wasSlow = true;

      logger
        .fork("custom-hook")
        .warn(`Hook ${key} for integration ${integration.name} is slow...`);
    }, SLOW_WARNING_TIMEOUT);

    logger.debug(`Starting ${key} for ${integration.name}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      await hook({
        ...payload,
        logger: logger.fork(integration.name),
      } as any);
    } catch (err) {
      logger.error(`Error running ${key} hook for ${integration.name}`);
      throw err;
    } finally {
      clearTimeout(timeout);

      if (wasSlow) {
        const endTime = performance.now();
        const diffMs = endTime - startTime;
        const centis = Math.floor(diffMs / 10) % 100;
        const seconds = Math.floor(diffMs / 1000);

        logger
          .fork("custom-hook")
          .warn(
            `Hook ${key} for integration ${integration.name} completed after ${seconds}.${centis.toString().padStart(2, "0")} seconds`,
          );
      }
    }
    logger.debug(`Finished ${key} for ${integration.name}`);
  }
}
