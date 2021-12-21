# GPT-3 Tools

This is a UI project for teams who wishes to operate their GPT-3 APIs. We are currently focus on providing a fine-tuning UI so one can quickly import data and trigger fine-tuning.

## Development and Usage

This is a standard NextJS project with Prisma, and we store the raw fine-tuning data in SQL database (SQLite mostly). For interacting with the OpenAI API, we currently rely on another project of ours, [openai-serverless](https://github.com/xanthous-tech/openai-serverless), along with OpenAI's Python SDK to keep us sane. The fine-tune JSON lines data will be stored on S3 via the openai-serverless project. More documentation to come.

## License

MIT
