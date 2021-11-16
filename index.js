const { clearAll, getList } = require('./store')
const { prompt, promptConfirm } = require('./prompt')

console.log('Hello, Welcome to the Trusk ChatBOT')

const generateEmployeesPrompts = async (employees, nbEnmployees, callback) => {
    const i = Object.keys(employees).length;
    if(i < nbEnmployees){
        const getEmployeesName = await prompt({
            type: 'input',
            name: `employeesName_${i}`,
            message: `Nom de l'employé ${nbEnmployees > 1 ? `numéro ${i+1} ` : ''}?`,
        })
        employees = { ...employees, ...getEmployeesName }

        await generateEmployeesPrompts(employees, nbEnmployees, callback);
    } else {
        callback(employees);
    }
}

const generateTrucksPrompts = async (trucks, i, nbTrucks, callback) => {
    if(i < nbTrucks){
        const getTruckVolume = await prompt({
            type: 'number',
            name: `truckVolume_${i}`,
            message: `Volume du camion ${nbTrucks > 1 ? `numéro ${i+1} ` : ''}(en m²) ?`,
        })

        const getTruckType = await prompt({
            type: 'input',
            name: `truckType_${i}`,
            message: `Type du camion ${nbTrucks > 1 ? `numéro ${i+1} ` : ''}?`,
        })
        
        trucks = { ...trucks, ...getTruckVolume, ...getTruckType}

        await generateTrucksPrompts(trucks, i+1, nbTrucks, callback);
    } else {
        callback(trucks)
    }
}

const promptsList = async () => {    
    const getName = await prompt({
        type: 'input',
        name: 'name',
        message: 'Nom du Trusker ?',
    })

    const getEntityName = await prompt({
        type: 'input',
        name: 'entityName',
        message: 'Nom de la société ?',
    })

    let getEmployeesName = {}

    const getNbEnmployees = await prompt({
        type: 'number',
        name: 'nbEnmployees',
        message: 'Nombre d\'employés ?'
    }).then(async (reply) => {
        await generateEmployeesPrompts({}, reply.nbEnmployees, (employess) => {
            getEmployeesName = employess
        })
    }) 

    let getTrucksInfos = {}
    const getNbTrucks = await prompt({
        type: 'number',
        name: 'nbTrucks',
        message: 'Nombre de camions ?'
    }).then(async (reply) => {
        await generateTrucksPrompts({}, 0, reply.nbTrucks, (trusks) => {
            getTrucksInfos = trusks
        })
    })

    const response = { 
        ...getName,
        ...getEntityName,
        ...getNbEnmployees,
        ...getEmployeesName,
        ...getNbTrucks,
        ...getTrucksInfos
    }

    return response
}

const main = async () => {
    // Check keys exists in redis
    const redisKeys = await getList('*')
    
    if(Object.keys(redisKeys).length > 0){
        console.log(redisKeys);
        const getContinueForm = await promptConfirm('Voulez-vous continuer avec ces données ?')
        if(getContinueForm === false){
            // Clean redis
            await clearAll()
            // Restart form
            return await main()
        }
    }
    
    const prompts = await promptsList()

    console.log(prompts)
    const getValidForm = await promptConfirm('Les informations sont elles valides ?')
    if(getValidForm === false){
        // Clean redis
        await clearAll()
        // Restart form
        return await main()
    } else {
        console.log("Merci d'avoir répondu au questionnaire, Bonne journée")
        // Clean redis
        await clearAll()
        process.exit()
    }
}

main()