
//"http://45.76.57.36:7500/question/",









let callFaqAPI = (session, original_question) => {

original_question = original_question.trim();
question= original_question.replace(/[?,.!'"]/gi,"");
original_question= original_question.replace("/","");

var corrected_question = original_question;

if(original_question.toUpperCase() != corrected_question.toUpperCase()){
    session.send('faq_did_you_mean').send(corrected_question);
}
session.conversationData.corrected_question = corrected_question;
var unirest = require('unirest');
unirest.get(config.FAQ_URL + session.conversationData.tenantid + "/" + corrected_question).headers({
    'Content-type': 'application/json'
}).end(function (res) {
    if (res.error) {
        console.log('GET error', res.error)
        console.log('Go to begin Dialog Cont');
        session.send('faq_server_issue')
        .beginDialog('/sayHicont');
        return 3;
    }
else if(res.body.response_list && res.body.response_list.length > 0){
        var answer2 = {};
        var answer3 = {};
        answer1 = res.body.response_list[0];
        if(res.body.response_list.length>1)answer2 = res.body.response_list[1];
        if(res.body.response_list.length>2)answer3 = res.body.response_list[2];
        session.conversationData.answers = res.body.response_list;
        console.log("confidenceeeeee-"+answer1.confidence);
        if (answer1.confidence > config.CONF_LEVEL_UPPER) {
            var msg = sf.createHTMLMessage(session, answer1.answer);
            session.send(msg);

            session.conversationData.faqHistory.conversation.questions.push(original_question);
            session.conversationData.faqHistory.conversation.answers.push(answer1.answer);

            logFAQHistory(session);

            MongoClient.connectDB(config.MONGODB_DB)
            .then((dbase) => {

                dbase.collection("tenant:"+String(session.conversationData.tenantid)).findOne({_id:"DashboardDetails"},function(err, res){
                    if(err) session.send("unexpected_error");
                    if(res.FAQDetails.TotalQuestion[session.conversationData.day] == null) res.FAQDetails.TotalQuestion[session.conversationData.day] = 1; else res.FAQDetails.TotalQuestion[sessio$
                    if(res.FAQDetails.QuestionsAnswered[session.conversationData.day] == null) res.FAQDetails.QuestionsAnswered[session.conversationData.day] = 1; else res.FAQDetails.QuestionsAns$
                    if(res.FAQDetails.PopularQuestions[answer1.question]){
                        console.log(res.FAQDetails.PopularQuestions[answer1.question]);
                        res.FAQDetails.PopularQuestions[answer1.question] ++;
                    }else{
                        res.FAQDetails.PopularQuestions[answer1.question] = 1;
                    }
                    console.log('Incrementing popular question ...... ', res.FAQDetails.PopularQuestions[answer1.question])

                    dbase.collection("tenant:"+String(session.conversationData.tenantid)).updateOne({_id:"DashboardDetails"},{$set:{FAQDetails:res.FAQDetails}},function(err,res){
                        if(err) session.send("unexpected_error");
                        session.beginDialog('/FAQ');
                    });
                });
            });
        }
else if(answer1.confidence < config.CONF_LEVEL_UPPER && answer1.confidence > config.CONF_LEVEL_LOWER) {
            session.send("faq_closest_answer");
            session.conversationData.solutions = ["First Answer"];
            session.send(sf.createHTMLMessage(session, res.body.response_list[0].answer));
            session.conversationData.faqHistory.conversation.questions.push(original_question);
            session.conversationData.faqHistory.conversation.answers.push("faq_closest_answer",res.body.response_list[0].answer);
            if(answer2.confidence != null && answer2.confidence < config.CONF_LEVEL_UPPER && answer2.confidence > config.CONF_LEVEL_LOWER){
                session.send("faq_other_answers");
                session.conversationData.solutions.push("Second Answer");
                session.send(sf.createHTMLMessage(session, res.body.response_list[1].answer));
                session.conversationData.faqHistory.conversation.answers.push("faq_other_answers", res.body.response_list[1].answer);
            }
            if(answer3.confidence != null && answer3.confidence < config.CONF_LEVEL_UPPER && answer3.confidence > config.CONF_LEVEL_LOWER){
                session.conversationData.solutions.push("Third Answer");
                session.send(sf.createHTMLMessage(session, res.body.response_list[2].answer));
                session.conversationData.faqHistory.conversation.answers.push(res.body.response_list[2].answer);
            }
            logFAQHistory(session);
            session.beginDialog('/FAQ')
        }
        else{
            session.conversationData.questions_unanswered++;
            MongoClient.connectDB(config.MONGODB_DB)
            .then((dbase) => {

                dbase.collection("tenant:"+String(session.conversationData.tenantid)).findOne({_id:"DashboardDetails"},function(err, res){
                    if(err) session.send("unexpected_error");
                    if(res.FAQDetails.QuestionsUnanswered[session.conversationData.day] == null) res.FAQDetails.QuestionsUnanswered[session.conversationData.day] = 1; else res.FAQDetails.Question$
                    res.FAQDetails.NeedAnswersQuestions.push(session.conversationData.corrected_question);
                    dbase.collection("tenant:"+String(session.conversationData.tenantid)).updateOne({_id:"DashboardDetails"},{$set:{FAQDetails:res.FAQDetails}},function(err,res){
                        if(err) session.send("unexpected_error");
                        if(session.conversationData.questions_unanswered>4) {
                            session.send("faq_knowledge_base_limited")
                            session.beginDialog('/stop faq');
                        }
                        else{
                            //var msg = sf.createHTMLMessage(session, "I am sorry my knowledgebase is not complete to answer this query.");
                            session.send('faq_knowledge_base_limited');
                            session.beginDialog('/FAQ');
                        }
                    });
                });
            });
}
})
}





