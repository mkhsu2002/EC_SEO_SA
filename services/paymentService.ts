import { callApi } from './firebaseService';

/**
 * Calls the backend to create an ECPay order for the currently authenticated user.
 * @returns The parameters needed to build the ECPay payment form.
 */
export const createEcpayOrder = async (): Promise<any> => {
    // UID is no longer needed in the payload as the backend gets it from the auth token.
    return callApi('createEcpayOrder', {});
};
