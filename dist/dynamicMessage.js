class DynamicMessage {
    manager;
    ref;
    message;
    data;
    constructor(manager, ref, message) {
        this.manager = manager;
        this.ref = ref;
        this.message = message;
        this.data = ref.data;
    }
    async onCreated() { }
    async onLoaded() { }
    async onTimedUpdate() { }
    async delete() {
        await this.message.delete().catch(() => { });
        this.manager.messages = this.manager.messages.filter(m => m.ref.messageId != this.ref.messageId);
        await this.manager.framework.dynamicMessages.collection.deleteOne({ messageId: this.ref.messageId });
    }
}
const defaultDMMOptions = {
    timedUpdateInterval: -1,
    maxPerChannel: -1,
    maxPerGuild: -1
};
class DynamicMessageManager {
    framework;
    ctor;
    options;
    constructor(framework, ctor, options = {}) {
        this.framework = framework;
        this.ctor = ctor;
        this.options = { ...defaultDMMOptions, ...options };
    }
    messages = [];
    async load() {
        const typeKey = this.ctor.name;
        const instances = await this.framework.dynamicMessages.collection.find({ type: typeKey }).toArray();
        const proms = instances.map(async (instance) => {
            const guild = await this.framework.client.guilds.fetch(instance.guildId).catch(() => { });
            if (!guild)
                return this.framework.log.warn(`Failed to fetch guild ${instance.guildId} for dynamic message ${instance.messageId}`);
            const channel = await guild.channels.fetch(instance.channelId).catch(() => { });
            if (!channel || !channel.isTextBased())
                return this.framework.log.warn(`Failed to fetch channel ${instance.channelId} for dynamic message ${instance.messageId}`);
            const dMessage = await channel.messages.fetch(instance.messageId).catch(() => { });
            if (!dMessage)
                return this.framework.log.warn(`Failed to fetch message ${instance.messageId} for dynamic message ${instance.messageId}`);
            const message = new this.ctor(this, instance, dMessage);
            await message.onLoaded();
            this.messages.push(message);
        });
        await Promise.all(proms);
        if (this.options.timedUpdateInterval != -1)
            setInterval(this.updateLoop.bind(this), 250);
    }
    updateLoop() {
        this.messages.forEach(async (message) => {
            const now = Date.now();
            if (now - message.ref.lastUpdated > this.options.timedUpdateInterval) {
                await message.onTimedUpdate();
                message.ref.lastUpdated = now;
                await this.framework.dynamicMessages.collection.updateOne({ messageId: message.ref.messageId }, { $set: { lastUpdated: now } });
            }
        });
    }
    async create(message, data) {
        const typeKey = this.ctor.name;
        const ref = {
            guildId: message.guild.id,
            channelId: message.channel.id,
            messageId: message.id,
            lastUpdated: Date.now(),
            data: data || {},
            type: typeKey
        };
        const newMessage = new this.ctor(this, ref, message);
        await newMessage.onCreated();
        this.messages.push(newMessage);
        await this.framework.dynamicMessages.collection.insertOne(ref);
        if (this.options.maxPerChannel != -1) {
            const channelMessages = this.messages.filter(m => m.ref.channelId == message.channel.id);
            if (channelMessages.length > this.options.maxPerChannel) {
                const oldest = channelMessages.sort((a, b) => a.ref.lastUpdated - b.ref.lastUpdated)[0];
                await oldest.delete();
                this.framework.log.info(`Deleted oldest ${typeKey} message in channel ${message.channel.id} as there were too many (${this.options.maxPerChannel})`);
            }
        }
        if (this.options.maxPerGuild != -1) {
            const guildMessages = this.messages.filter(m => m.ref.guildId == message.guild.id);
            if (guildMessages.length > this.options.maxPerGuild) {
                const oldest = guildMessages.sort((a, b) => a.ref.lastUpdated - b.ref.lastUpdated)[0];
                await oldest.delete();
                this.framework.log.info(`Deleted oldest ${typeKey} message in guild ${message.guild.id} as there were too many (${this.options.maxPerGuild})`);
            }
        }
        return newMessage;
    }
}
export { DynamicMessage, DynamicMessageManager };
