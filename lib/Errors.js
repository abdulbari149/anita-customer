export class ParameterError extends Error {
  constructor(parameters) {
    super()
    this.parameters = parameters
  }
}

export class InternalServerError extends Error {
  constructor() { 
    super(`Sorry, something went wrong. We've been notified and will fix it ASAP.`) 
  }
}

export class ServerConnectionError extends Error {
  constructor() { 
    super(`Unable to connect. Please check your internet connection and try again.`) 
  }
}