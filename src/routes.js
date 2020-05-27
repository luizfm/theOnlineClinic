const express = require('express')
const routes = express.Router()

const fs = require('fs')
const data = require('../data.json')
const { date } = require('./app/config/utils')

routes.get("/", function(req, res) {
    return res.redirect("/main")
})

routes.get("/main", function(req, res) {
    return res.render("main/home")
})

routes.get("/members", function(req, res) {
    return res.render("members/create")
})

routes.get("/members/:id", function(req, res) {

    const { id } = req.params

    const foundPatient = data.patients.find(function(member) {
        return member.id == id
    })

    if(!foundPatient) return res.send("Patient not found!")

    const member = {
        ...foundPatient,
        appointment_date: date(foundPatient.appointment_date).iso
    }

    return res.render("members/show", { member })
})

routes.get("/members/:id/edit", function(req, res) {
    
    const { id } = req.params

    const foundMember = data.patients.find(function(member) {
        return member.id == id
    })

    if(!foundMember) return res.send('Member not found!')

    const member = {
        ...foundMember,
        appointment_date: date(foundMember.appointment_date).isoCalendar
    }

    
    return res.render("members/edit", {member})
})

routes.post("/members", function(req, res) {
    
    const keys = Object.keys(req.body)

    for(key of keys) {
        if(req.body[key] == "") {
            return res.send('Please, fill all the fields')
        }
    }

    const id = Number(data.patients.length + 1)

    let { name, cpf, height, weight, phone, email, service, appointment_date } = req.body

    

    data.patients.push({
        id,
        name,
        cpf,
        height,
        weight,
        phone,
        email,
        service,
        appointment_date
    })


    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if (err) return res.send("Write file error!")

        return res.redirect("/cooperators")
    })

})

routes.put("/members", function(req, res) {
    
    const { id } = req.body
    let index = 0

    const foundMember = data.patients.find(function(member, foundIndex) {
        if(id == member.id) {
            index = foundIndex
            return true
        }
    })

    if(!foundMember) return res.send("Patient not found!")

    const member = {
        ...foundMember,
        ...req.body,
        id: Number(req.body.id)
    }

    data.patients[index] = member

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if(err) return res.send("Writting error!")

        return res.redirect(`/members/${id}`)
    })

})

routes.delete("/members", function(req, res) {
    const { id } = req.body

    const filteredMembers = data.patients.filter(function(member) {
        return member.id != id
    })

    data.patients = filteredMembers

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if(err) return res.send("Writting error!")

        return res.redirect("/cooperators")
    })
})



routes.get("/cooperators", function(req, res) {

    return res.render("cooperators/index", { members: data.patients })
})

routes.delete("/cooperators", function(req, res) {
    const { id } = req.body

    const filteredMembers = data.patients.filter(function(member) {
        return member.id != id
    })

    data.patients = filteredMembers

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function(err) {
        if(err) return res.send("Writting error!")

        return res.redirect("/cooperators")
    })
})

module.exports = routes