const { clearAll, getList } = require('./store')
const { prompt, promptConfirm } = require('./prompt')

console.log('Hello, Welcome to the Trusk ChatBOT')

const generateEmployeesQuestions = async (nbEnmployees) => {
    let employeesForm = {}
    for(i=0; i < nbEnmployees; i++){
        const getEmployeesName = await prompt({
            type: 'input',
            name: `employeesName_${i}`,
            message: `Nom de l'employé ${nbEnmployees > 1 ? `numéro ${i+1} ` : ''}?`,
        })
        employeesForm = { ...employeesForm, ...getEmployeesName }
    }
    return employeesForm
}

const generateTrucksQuestions = async (nbTrucks) => {
    let trucksForm = {}

    for(i=0; i < nbTrucks; i++){
        const getTruckVolume = await prompt({
            type: 'number',
            name: `truck_volume_${i}`,
            message: `Volume du camion ${nbTrucks > 1 ? `numéro ${i+1} ` : ''}(en m²) ?`,
        })

        const getTruckType = await prompt({
            type: 'input',
            name: `truck_type_${i}`,
            message: `Type du camion ${nbTrucks > 1 ? `numéro ${i+1} ` : ''}?`,
        })
        trucksForm = { ...trucksForm, ...getTruckVolume, ...getTruckType }
    }
    return trucksForm
}

const questionsList = async () => {    
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
    
    const getNbEnmployees = await prompt({
        type: 'number',
        name: 'nbEnmployees',
        message: 'Nombre d\'employés ?'
    })

    const getEmployeesName = await generateEmployeesQuestions(getNbEnmployees.nbEnmployees)

    const getNbTrucks = await prompt({
        type: 'number',
        name: 'nbTrucks',
        message: 'Nombre de camions ?'
    })

    const getTrucksInfos = await generateTrucksQuestions(getNbTrucks.nbTrucks)

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
    
    const prompts = await questionsList()

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