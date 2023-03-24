export const DISPATCHER_TIME_INTERVAL = 10000;
export const WEAKEN_TIME_CUTOFF_BASE = 1*60*1000; //1*60*1000 = 1 Minute
export const WEAKEN_TIME_CUTOFF_HACK_LEVEL_INCREMENTS = 100; //Every X hacking level cutoff time increases

export const TIME_BETWEEN_ATTACK_PHASES = 500;

export const MIN_TIME_BETWEEN_ATTACKS_START = TIME_BETWEEN_ATTACK_PHASES * 5;

export const PURCHASED_SERVERS_COST_SAFETY_ADJUSTMENT = 2;
export const PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS = [
    {
        hackingLevel: 1,
        serverRam: 8,
    },
    {
        hackingLevel: 10,
        serverRam: 16,
    },
    {
        hackingLevel: 50,
        serverRam: 32,
    },
    {
        hackingLevel: 100,
        serverRam: 64,
    },
    {
        hackingLevel: 200,
        serverRam: 128,
    },
    {
        hackingLevel: 400,
        serverRam: 256,
    },
    {
        hackingLevel: 700,
        serverRam: 512,
    },
    {
        hackingLevel: 1000,
        serverRam: 1024,
    },
    {
        hackingLevel: 1500,
        serverRam: 2048,
    },
    {
        hackingLevel: 2000,
        serverRam: 4096,
    },
]