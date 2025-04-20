import { UpdaterArg } from "../types";

/**
 * Updates an object with new values.
 * @param obj - The object to update.
 * @param newVal - An object containing new values to update in the target object.
 */
export default function updateObject(obj: Object, newVal: UpdaterArg) {
    for (let key in newVal) {
        if (newVal.hasOwnProperty(key)) {
            obj[key] = newVal[key];
        }
    }
    return obj;
}
