import { registerI18nLoader, fetchI18nBundle, getI18nBundleData } from "./asset-registries/i18n.js";
import formatMessage from "./util/formatMessage.js";

const I18nBundleInstances = new Map<string, I18nBundle>();

let customGetI18nBundle: I18nBundleGetter;

type I18nText = {
	key: string,
	defaultText: string,
};
type GetText = (textObj: I18nText, ...params: Array<number | string>) => string;
type I18nBundleGetter = (packageName: string) => Promise<{ getText: GetText }>;

/**
 * @class
 * @public
 */
class I18nBundle {
	packageName: string;

	constructor(packageName: string) {
		this.packageName = packageName;
	}

	/**
	 * Returns a text in the currently loaded language
	 *
	 * @public
	 * @param {Object|String} textObj key/defaultText pair or just the key
	 * @param params Values for the placeholders
	 * @returns {string}
	 */
	getText(textObj: I18nText, ...params: Array<number | string>): string {
		if (typeof textObj === "string") {
			textObj = { key: textObj, defaultText: textObj };
		}

		if (!textObj || !textObj.key) {
			return "";
		}

		const bundle = getI18nBundleData(this.packageName);
		if (bundle && !bundle[textObj.key]) {
			console.warn(`Key ${textObj.key} not found in the i18n bundle, the default text will be used`); // eslint-disable-line
		}
		const messageText = bundle && bundle[textObj.key] ? bundle[textObj.key] : (textObj.defaultText || textObj.key);

		return formatMessage(messageText, params);
	}
}

const getI18nBundleSync = (packageName: string) => {
	if (I18nBundleInstances.has(packageName)) {
		return I18nBundleInstances.get(packageName)!;
	}

	const i18nBundle = new I18nBundle(packageName);
	I18nBundleInstances.set(packageName, i18nBundle);
	return i18nBundle;
};

/**
 * Allows developers to provide a custom getI18nBundle implementation
 * If this function is called, the custom implementation will be used for all components and will completely
 * replace the default implementation.
 *
 * @public
 * @param customGet the function to use instead of the standard getI18nBundle implementation
 */
const registerCustomI18nBundleGetter = (customGet: I18nBundleGetter) => {
	customGetI18nBundle = customGet;
};

/**
 * Fetches and returns the I18nBundle instance for the given package
 *
 * @public
 * @param packageName
 * @returns {Promise<I18nBundle>}
 */
const getI18nBundle = async (packageName: string) => {
	if (customGetI18nBundle) {
		return customGetI18nBundle(packageName);
	}

	await fetchI18nBundle(packageName);
	return getI18nBundleSync(packageName);
};

export {
	registerI18nLoader,
	getI18nBundle,
	registerCustomI18nBundleGetter,
};

export type {
	I18nText,
};