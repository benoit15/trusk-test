const inquirer = require('inquirer')
const { getValue, setValue } = require('./store');

const verifyValue = (value, type) => {
    let valid = true;
    let validType = typeof value === type;

    if(type === 'string'){
        valid = value.match(/^[a-zA-Z]+$/)
    }
    return value && valid && validType
}

const switchType = (type) => {
    switch(type){
        case 'input':
            return 'string'
        case 'list':
            return 'array'
        default:
            return type
    }
}


const prompt = async (value) => {
    const {
        type, 
        name,
    } = value

    // Check if prompt has been saved in Redis
    const redisValue = await getValue(name)
    if(!redisValue){
        // Run inquirer.prompt
        const response = await inquirer.prompt(value)

        // Verify value
        isValidValue = verifyValue(response[name], switchType(type))
        if(isValidValue){
            // Save in redis
            await setValue(name, response[name])
            return response
        } else {
            console.log('Le champ est invalide veuillez recommencer !')
            return await prompt(value)
        }
    } else {
        let obj = {}
        obj[name] = redisValue
        return obj
    }
}

const promptConfirm = async (message, defaultValue = false) => {
    const getValid = await inquirer.prompt({
        type: 'confirm',
        name: 'toBeValid',
        message,
        default: defaultValue,
    })

    return getValid.toBeValid
}

module.exports = {
    prompt,
    promptConfirm
}