import { useStrict, spy, action as mobxAction } from 'mobx';
import ActionContext from './ActionContext';
import ActionFunction from './ActionFunction';
import DispatchFunction from './DispatchFunction';
import { dispatchWithMiddleware } from './applyMiddleware';
import { getGlobalContext } from './globalContext';

export default function dispatch(action: ActionFunction, actionType: string, args: IArguments, actionContext: ActionContext): void | Promise<void> {
    // push dispatch stack state
    getGlobalContext().inDispatch++;
    let returnValue: void | Promise<void>;
    mobxAction(
        actionType ? actionType : "(anonymous action)",
        () => {
            returnValue = dispatchWithMiddleware(action, actionType, args, actionContext);
        })();

    // check if dispatch returns a promise
    if (typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function") {
        // if promise then mark dispatch complete when promise chain completes
        returnValue.then(() => {
            // pop dispatch stack state
            getGlobalContext().inDispatch--;
        });
    }
    else {
        // if dispatch is not a promise, then it was synchronously executed
        // pop dispatch stack state
        getGlobalContext().inDispatch--;
    }

    return returnValue;
}

// Guard against state changes happening outside of SatchelJS actions
useStrict(true);

spy((change) => {
    if (!getGlobalContext().inDispatch && change.type == "action") {
        throw new Error('The state may only be changed by a SatchelJS action.');
    }
});
