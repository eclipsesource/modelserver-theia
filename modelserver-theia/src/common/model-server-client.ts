/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

export const MODEL_SERVER_CLIENT_SERVICE_PATH = "/services/modelserverclient";

export const ModelServerClient = Symbol("ModelServerClient");
export interface ModelServerClient {
    initialize(): Promise<boolean>;

    get(modelUri: string): Promise<Response<string>>
    getAll(): Promise<Response<string[] | string>>
    delete(modelUri: string): Promise<Response<boolean>>
    update(modelUri: string, newModel: string): Promise<Response<string>>;

    getSchema(modelUri: string): Promise<Response<string>>

    configure(configuration?: ServerConfiguration): Promise<Response<boolean>>;
    ping(): Promise<Response<boolean>>;

    getLaunchOptions(): Promise<LaunchOptions>;
}


export const LaunchOptions = Symbol("LaunchOptions");
export interface LaunchOptions {
    baseURL: string
    serverPort: number
    hostname: string
    jarPath?: string
    additionalArgs?: string[];
}
export const DEFAULT_LAUNCH_OPTIONS: LaunchOptions = {
    baseURL: "api/v1",
    serverPort: 8081,
    hostname: "localhost"
};

export interface ServerConfiguration {
    workspaceRoot: string;
}
export class Response<T> {

    constructor(readonly body: T, readonly statusCode: number, readonly statusMessage: string) { }

    public mapBody<U>(mapper: (body: T) => U): Response<U> {
        return new Response(mapper(this.body), this.statusCode, this.statusMessage);
    }
}

