const wraper = async (req, res, func) => {
    try {
        return await func(req, res)
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occurred!")
    }
}
module.exports = wraper