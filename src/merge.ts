function merge(...args: Array<any>) {
    let merged: any = {};

    function toString(object: any) {
        return Object.prototype.toString.call(object)
    }

    function whichType(object: any, type: string) {
        return toString(object) === `[object ${type}]`
    }

    function generateObject(target: any = {}, object: any) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                target[key] = object[key]
            }
        }
        return target
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (arg) {
            if (whichType(arg, "Array")) {
                for (let i = 0; i < arg.length; i++) {
                    let argItem = arg[i];
                    if (whichType(argItem, "Object")) {
                        merged = generateObject(merged, argItem)
                    } else if (!whichType(argItem, "Date")) {
                        merged[argItem] = argItem
                    }
                }
            } else if (whichType(arg, "Object")) {
                merged = generateObject(merged, arg)
            } else if (whichType(arg, "String") || whichType(arg, "Number")) {
                merged[arg] = arg
            }
        }
    }
    return merged
}

export default merge