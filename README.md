from flask import Flask, url_for, redirect, request, render_template
import app.dnspython as dns
import ipwhois
import requests
import dns.resolver
from flask_jwt import JWT, jwt_required, current_identity
import json
from flask_api import status
from requests import get
from datetime import datetime


def whois_module(app, mongo, *args): #who is module

    def whois_process(hostname, mongo):
        if('https' in hostname or 'http' in hostname):
            domain = hostname.split('//')
            hostname = domain[1]
        #caching 
        dbstore = {}        
        dbstore['input'] = hostname
        dbstore['tool'] = "whois"
        dbstore['timestamp'] = datetime.now()
        record = mongo.db.cachedInfo #creating object 'record' of mongodb collection 'cachedInfo'
        #checking if output already exist in cache
        for x in record.find():
            if x.get('input') == hostname and x.get('tool') == "whois":
                c = dbstore['timestamp']-x.get('timestamp')
                if(c.days < 7): #cache timeout set to 7days
                    return x.get('output') #returns output from cache
        try:
            result = dns.resolver.query(hostname, 'A') #domain name to ip address
            for ipval in result:  
                ip = ipval.to_text() #ip address

            lookup = ipwhois.IPWhois(ip)
            results = lookup.lookup_whois()
            content = json.dumps(results) #output


            #adding whoxy source to previous output
            temp = json.loads(content)
            lists = list()
            lists = temp['nets'][0]['emails']
            link = "http://api.whoxy.com/?key=6b54c04d89472c84czf1efd1c732fbc83&whois="+hostname #whoxy api 
            data = requests.get(link)
            info = data.json()
            data = json.dumps(info)
            temp_whoxy = json.loads(data)
            keys = []
            dr_keys = []
            rc_keys = []
            ac_keys = []
            tc_keys = []   
            keys=[str(k) for k,v in temp_whoxy.items()]
            if "domain_registrar" in keys:
                for k,v in temp_whoxy["domain_registrar"].items():
                    dr_keys.append(k)
                if "email_address" in dr_keys:
                    lists.append(temp_whoxy["domain_registrar"]["email_address"])
            if "registrant_contact" in keys:
                for k,v in temp_whoxy["registrant_contact"].items():
                    rc_keys.append(k)
                if "email_address" in rc_keys:
                    lists.append(temp_whoxy["registrant_contact"]["email_address"])
            if "administrative_contact" in keys:
                for k,v in temp_whoxy["administrative_contact"].items():
                    ac_keys.append(k)
                if "email_address" in ac_keys:
                    lists.append(temp_whoxy["administrative_contact"]["email_address"])
            if "technical_contact" in keys:
                for k,v in temp_whoxy["technical_contact"].items():
                    tc_keys.append(k)
                if "email_address" in tc_keys:
                    lists.append(temp_whoxy["technical_contact"]["email_address"])

            temp['nets'][0]['emails'] = list(set(lists))
            contents = json.dumps(temp)

            dbstore['output'] = contents 
            record.insert_one(dbstore) #pushing data to mongodb
            return contents #returning output
        except Exception:
            error = {"error": "Please try Again"}
            return json.dumps(error), status.HTTP_500_INTERNAL_SERVER_ERROR

    if(len(args) != 0): #if extra argument then call from workflow modules to whois_module
        try:
            hostname = args[0]
            x = whois_process(hostname, mongo) #call from workflow module inturn calls the who is process
            return x
        except:
            error={"error": "Please try Again"}
            return json.dumps(error), status.HTTP_500_INTERNAL_SERVER_ERROR
    else:
        pass

    @app.route('/modules/whois', methods=['POST'])
    @jwt_required()
    def whois():
        try:
            req_data = request.get_json()  # {"hostname":"www.targetwebsite.com"} input
            hostname = req_data['hostname']
            if(hostname==""):              # cleaning input
                return json.dumps({"error":"Please enter a valid input"}),status.HTTP_500_INTERNAL_SERVER_ERROR
            return whois_process(hostname, mongo) #calling is whois module
        except:
            error={"error": "Please try Again"}
            return json.dumps(error), status.HTTP_500_INTERNAL_SERVER_ERROR
        
