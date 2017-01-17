import ActionContext from './ActionContext';
import ActionFunction from './ActionFunction';
import DispatchFunction from './DispatchFunction';
import Middleware from './Middleware';
import { getGlobalContext } from './globalContext';


export default function applyMiddleware(...middleware: Middleware[]) {
    var next: DispatchFunction = finalDispatch;
    for (var i = middleware.length - 1; i >= 0; i--) {
        next = applyMiddlewareInternal(middleware[i], next);
    }

    getGlobalContext().dispatchWithMiddleware = next;
}

function applyMiddlewareInternal(middleware: Middleware, next: DispatchFunction): DispatchFunction {
    return (action, actionType, args, actionContext) => middleware(next, action, actionType, args, actionContext);
}

export function dispatchWithMiddleware(action: ActionFunction, actionType: string, args: IArguments, actionContext: ActionContext): void | Promise<void> {
    let globalContext = getGlobalContext();
    if (!globalContext.dispatchWithMiddleware) {
        globalContext.dispatchWithMiddleware = finalDispatch;
    }

    let returnVal = globalContext.dispatchWithMiddleware(action, actionType, args, actionContext);

    if (globalContext.dispatchWithMiddleware === finalDispatch) {
        // Don't return the value from target action, it could be a Promise
        // and thus confuse dispatcher about whether middleware returns a promise
        return;
    } else {
        return returnVal;
    }
}

function finalDispatch(action: ActionFunction, actionType: string, args: IArguments, actionContext: ActionContext) {
    return action();
}
