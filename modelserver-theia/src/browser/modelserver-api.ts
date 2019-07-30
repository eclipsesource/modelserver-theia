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
    delete(modelUri: string): Promise<Response<boolean>>
    update(modelUri: string, newModel: string): Promise<Response<string>>;

    getSchema(modelUri: string): Promise<Response<string>>

    configure(configuration?: ServerConfiguration): Promise<Response<boolean>>;
    ping(): Promise<Response<boolean>>;
}


@injectable()
export class DefaultModelServerApi implements ModelServerApi {
    @inject(ModelServerBackend) protected readonly modelServerBackend: ModelServerBackend;
    private restClient: RestClient;

    initialize(): Promise<boolean> {
        return this.modelServerBackend.getLaunchOptions().then(options => {
            this.restClient = new RestClient(`http://${options.hostname}:${options.serverPort}/${options.baseURL}`);
            return true;
        });
    }

    get(modelUri: string): Promise<Response<string>> {
        return this.restClient.get(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    getAll(): Promise<Response<string[]>> {
        return this.restClient.get(ModelServerPaths.MODEL_CRUD)
            .then(r => r.mapBody(b => b.data));
    }
    delete(modelUri: string): Promise<Response<boolean>> {
        return this.restClient.remove(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`)
            .then(r => r.mapBody(b => b.type === "confirm"));
    }
    update(modelUri: string, newModel: any): Promise<Response<string>> {
        return this.restClient.patch(`${ModelServerPaths.MODEL_CRUD}/${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    getSchema(modelUri: string): Promise<Response<string>> {
        return this.restClient.get(`${ModelServerPaths.SCHEMA}/${modelUri}`)
            .then(r => r.mapBody(b => b.data));
    }

    configure(configuration: ServerConfiguration): Promise<Response<boolean>> {
        return this.restClient.put(ModelServerPaths.SERVER_CONFIGURE, configuration)
            .then(r => r.mapBody(b => b.type === "success"));
    }

    ping(): Promise<Response<boolean>> {
        return this.restClient.get(ModelServerPaths.SERVER_PING)
            .then(r => r.mapBody(b => b.type === "success"));
    }
}

export interface ServerConfiguration {
    workspaceRoot: string;
}
