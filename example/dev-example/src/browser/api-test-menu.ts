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
import { ModelServerApi } from "@modelserver/theia/lib/browser";
import {
    Command,
    CommandContribution,
    CommandRegistry,
    MAIN_MENU_BAR,
    MenuContribution,
    MenuModelRegistry,
    MessageService
} from "@theia/core";
import { inject, injectable } from "inversify";

export const GetSchemaCommand: Command = {
    id: 'ApiTest.GetSchema',
    label: 'getSchema(SuperBrewer3000.coffee)',
};

export const PingCommand: Command = {
    id: 'ApiTest.Ping',
    label: "ping()"
};

export const GetModelCommand: Command = {
    id: 'ApiTest.GetModel',
    label: "getModel(SuperBrewer3000.coffee)"
};

export const API_TEST_MENU = [...MAIN_MENU_BAR, '9_API_TEST_MENU'];
export const GET_SCHEMA = [...API_TEST_MENU, GetSchemaCommand.label];
export const PING = [...API_TEST_MENU, PingCommand.label];
export const GET_MODEL = [...API_TEST_MENU, GetModelCommand.label];


@injectable()
export class ApiTestMenuContribution implements MenuContribution, CommandContribution {
    @inject(MessageService) protected readonly messageService: MessageService;
    @inject(ModelServerApi) protected readonly modelServerApi: ModelServerApi;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(GetSchemaCommand, {
            execute: () => {
                this.modelServerApi.getSchema("SuperBrewer3000.coffee")
                    .then(response => this.messageService.info(response.toString()));
            }
        });
        commands.registerCommand(PingCommand, {
            execute: () => {
                this.modelServerApi.ping()
                    .then(response => this.messageService.info(response.toString()));
            }
        });
        commands.registerCommand(GetModelCommand, {
            execute: () => {
                this.modelServerApi.get("SuperBrewer3000.coffee")
                    .then(response => this.messageService.info(response.toString()));
            }
        });
    }
    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(API_TEST_MENU, 'ModelServer');
        menus.registerMenuAction(API_TEST_MENU, { commandId: PingCommand.id });
        menus.registerMenuAction(API_TEST_MENU, { commandId: GetSchemaCommand.id });
        menus.registerMenuAction(API_TEST_MENU, { commandId: GetModelCommand.id });
    }
}


