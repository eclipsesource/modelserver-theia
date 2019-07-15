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
import { inject, injectable } from "inversify";

import { ModelServerBackend } from "../common/model-server-backend";
import { ModelServerPaths } from "../common/model-server-paths";
import { Response, RestClient } from "./rest-client";

export const ModelServerApi = Symbol("ModelServerApi");

export interface ModelServerApi {
    initialize(): Promise<boolean>;

    get(modelUri: string): Promise<Response<string>>
    getAll(): Promise<Response<string[]>>
    delete(modelUri: string): Promise<void>
    update(modelUri: string, newModel: string): Promise<void>;

    getSchema(modelUri: string): Promise<Response<string>>

    configure(configuration?: ServerConfiguration): Promise<void>;
    ping(): Promise<Response<string>>;
}


@injectable()
export class DefaultModelServerApi implements ModelServerApi {
    @inject(ModelServerBackend) protected readonly modelServerBackend: ModelServerBackend;
    private restClient: RestClient;

    initialize(): Promise<boolean> {
        this.modelServerBackend.getLaunchOptions().then(options => {
            this.restClient = new RestClient(`http://${options.hostname}:${options.serverPort}/${options.baseURL}`);
            return true;
        });
        return Promise.resolve(false);
    }

    async get(modelUri: string): Promise<Response<string>> {
        return this.restClient.get<string>(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`);
    }

    async getAll(): Promise<Response<string[]>> {
        return this.restClient.get<string[]>(ModelServerPaths.MODEL_CRUD);
    }
    async delete(modelUri: string): Promise<void> {
        this.restClient.remove(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`);
    }
    async update(modelUri: string, newModel: any): Promise<void> {
        this.restClient.patch<string>(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`);
    }

    async getSchema(modelUri: string): Promise<Response<string>> {
        return this.restClient.get<string>(`${ModelServerPaths.SCHEMA}/${modelUri}`);
    }

    async configure(configuration: ServerConfiguration): Promise<void> {
        this.restClient.put(ModelServerPaths.SERVER_CONFIGURE, configuration);
    }

    ping(): Promise<Response<string>> {
        return this.restClient.get<string>(ModelServerPaths.SERVER_PING);
    }
}

export interface ServerConfiguration {
    workspaceRoot: string;
}
