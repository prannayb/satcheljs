import ActionContext from './ActionContext';
import dispatch from './dispatch';
import { setOriginalTarget } from './functionInternals';

export interface RawAction {
    (...args: any[]): Promise<any> | void;
}

export default function action(actionType: string, actionContext?: ActionContext) {
    return function action<T extends RawAction>(target: T): T {
        let decoratedTarget = <T>function () {
            let returnValue: any;
            let passedArguments = arguments;

            let dispatchReturnVal = dispatch(
                () => { 
                    returnValue = target.apply(undefined, passedArguments); 
                    return returnValue; 
                },
                actionType,
                arguments,
                actionContext);

            // check for promise returned, in case of async middleware
            if (typeof dispatchReturnVal === "object" && dispatchReturnVal !== null && typeof dispatchReturnVal.then === "function") {
                // if dispatch returns a promise, 
                // then the action function won't get executed till middleware promises resolve.
                // So, return a promise that resolves when middleware completes, 
                // resolve with action return value
                return dispatchReturnVal.then(() => {
                    return returnValue;
                });
            }
            else {
                //middleware absent or synchronous
                return returnValue;
            }
        };

        setOriginalTarget(decoratedTarget, target);

        return decoratedTarget;
    }
}
