export abstract class ConfigServiceAbstract {
  /**
   * The keys of environment system managed.
   *
   * @protected
   */
  protected readonly systemManagedEnvKeys: string[] = ['APP_ENV', 'NODE_ENV'];

  /**
   * The keys of environment managed.
   *
   * @protected
   */
  protected readonly managedEnvKeys: string[] = [];

  /**
   * The environment keys required
   *
   * @protected
   */
  protected readonly requiredEnvKeys: string[] = [];

  /**
   * The available environment keys
   *
   * @protected
   */
  protected readonly env: { [key: string]: any } = {};

  /**
   * The environment production keys
   *
   * @protected
   */
  protected readonly envProductionKeys: string[] = ['production', 'prod'];

  /**
   * The environment testing keys
   *
   * @protected
   */
  protected readonly envTestingKeys: string[] = ['test'];

  protected init() {
    //assign system managed env key
    this.systemManagedEnvKeys.forEach((key: string) => {
      this.env[key] = process.env[key];
    });

    //assign managed env key
    this.managedEnvKeys.forEach((key: string) => {
      this.env[key] = process.env[key];
    });

    //validate env keys
    this.requiredEnvKeys.forEach((key: string) => {
      this.getValue(key, true);
    });
  }

  /**
   * @param key
   * @param throwOnMissing
   *
   * @return any
   * @exception Error
   */
  getValue(key: string, throwOnMissing = false): any {
    if (typeof this.env?.[key] == 'undefined' && throwOnMissing) {
      throw new Error(`Configuration error - missing env.${key}`);
    }

    return this.env[key];
  }

  /**
   * The function for get environment status
   *
   * @return boolean
   */
  isProduction() {
    return (
      this.envProductionKeys.includes(
        (this.getValue('APP_ENV') || '').toLowerCase(),
      ) ||
      this.envProductionKeys.includes(
        (this.getValue('NODE_ENV') || '').toLowerCase(),
      )
    );
  }

  /**
   * The function for get environment status
   *
   * @return boolean
   */
  isTesting() {
    return (
      this.envTestingKeys.includes(
        (this.getValue('APP_ENV') || '').toLowerCase(),
      ) ||
      this.envTestingKeys.includes(
        (this.getValue('NODE_ENV') || '').toLowerCase(),
      )
    );
  }
}
