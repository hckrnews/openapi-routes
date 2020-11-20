export default function makeCallback(controller, specification) {
    return async (context, req, res) => {
        try {
            const response = await controller(context, specification);

            res.type('json');
            res.status(200).send(response);
        } catch (error) {
            res.status(500).send({
                status: 500,
                timestamp: new Date(),
                message: error.message,
            });
        }
    };
}
