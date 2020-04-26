ESX = nil
local open,peek,mygroup = false,false,"user"

function updateNuiData()
	ESX.TriggerServerCallback("el_scoreboard:getPlayerData", function(a,b,c)
		SendNuiMessage(json.encode({type="update",data={pd=a,con=b,disc=c},mygroup=mygroup}))
	end)
end

Citizen.CreateThread(function()
    while ESX == nil do
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        Citizen.Wait(0)
    end
end)

RegisterNetEvent("esx:playerLoaded")
AddEventHandler('esx:playerLoaded', function(xPlayer)
	ESX.TriggerServerCallback("el_scoreboard:getServerName", function(sn)
		SendNuiMessage(json.encode({type="setup",pn=GetPlayerName(PlayerId()),sid=xPlayer.identifier,sn=sn}))
	end)
    ESX.TriggerServerCallback("el_scoreboard:whatsMyGroup", function(mg)
        mygroup=mg
    end)
	updateNuiData()
end)

Citizen.CreateThread(function()
	SetNuiFocus(false,false)
	while true do
		Citizen.Wait(Config.data_update_interval)
		if open or peek then
			updateNuiData()
		end
	end
end)

RegisterNetEvent("el_scoreboard:adminBringReq")
AddEventHandler("el_scoreboard:adminBringReq", function(target)
	ESX.Game.Teleport(GetPlayerPed(-1),GetEntityCoords(GetPlayerPed(GetPlayerFromServerId(target))))
end)

RegisterNetEvent("el_scoreboard:adminSlayReq")
AddEventHandler("el_scoreboard:adminSlayReq", function()
	SetEntityHealth(GetPlayerPed(-1), 0)
end)

RegisterNetEvent("el_scoreboard:adminHealReq")
AddEventHandler("el_scoreboard:adminHealReq", function()
	local ped = GetPlayerPed(-1)
	SetEntityHealth(ped, GetEntityMaxHealth(ped))
end)

RegisterNUICallback("toggle", function(data,cb) SetNuiFocus(data, data); open = data end)

RegisterNUICallback("admin-ctx", function(data,cb)
	local action = data.action -- string
	local target = data.target -- player server id (string)
	local args = data.args -- text input from user (can be null if input isn't needed, string)
	if action=="warn" then
		ESX.TriggerServerCallback("el_bwh:warn",function(success)
			if success then ESX.ShowNotification("~g~Successfully warned player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target, args, false)
	elseif action=="kick" then
		ESX.TriggerServerCallback("el_scoreboard:kick",function(success)
			if success then ESX.ShowNotification("~g~Successfully kicked player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target, args)
	elseif action=="goto" then
		ESX.Game.Teleport(GetPlayerPed(-1),GetEntityCoords(GetPlayerPed(GetPlayerFromServerId(target))))
		ESX.ShowNotification("~g~Successfully went to player")
	elseif action=="bring" then
		ESX.TriggerServerCallback("el_scoreboard:bringPlayer", function(success)
			if success then ESX.ShowNotification("~g~Successfully brought player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target)
	elseif action=="slay" then
		ESX.TriggerServerCallback("el_scoreboard:slayPlayer", function(success)
			if success then ESX.ShowNotification("~g~Successfully slain player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target)
	elseif action=="heal" then
		ESX.TriggerServerCallback("el_scoreboard:healPlayer", function(success)
			if success then ESX.ShowNotification("~g~Successfully healed player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target)
	elseif action=="revive" then
		ESX.TriggerServerCallback("el_scoreboard:revivePlayer", function(success)
			if success then ESX.ShowNotification("~g~Successfully revived player") else ESX.ShowNotification("~r~Something went wrong") end
		end, target)
	end
end)

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(0)
		if IsControlJustPressed(0, Config.open_key) and not peek then
			open = not open
			SendNuiMessage(json.encode({type="toggle",state=open}))
			SetNuiFocus(open, open)
			if open then
				updateNuiData()
			end
		end
		if IsControlJustPressed(0, Config.peek_key) and not open then
			if Config.peek_delay<1 then
				peek = true
				SendNuiMessage(json.encode({type="toggle",state=true,peeking=true}))
			else
				Citizen.SetTimeout(Config.peek_delay, function()
					if IsControlPressed(0, Config.peek_key) then
						updateNuiData()
						peek = true
						SendNuiMessage(json.encode({type="toggle",state=true,peeking=true}))
					end
				end)
			end
		end
		if IsControlJustReleased(0, Config.peek_key) and peek then
			peek = false
			SendNuiMessage(json.encode({type="toggle",state=false,peeking=true}))
		end
	end
end)

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(60000)
		ESX.TriggerServerCallback("el_scoreboard:whatsMyGroup", function(mg)
			mygroup=mg
		end)
	end
end)