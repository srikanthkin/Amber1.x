var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var fs = require('fs');
router.get('/reimburseUserDetails',reimburseUserDetails);
 
 var req_id="";

  function reimburseUserDetails(req,res){
  	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
    
   
    var test = req.body.test;
	var id = req.query.id;
	 
	 
	console.log('id',id);
	console.log('reimburseUserDetails func ');
    var urlValue = id.split(":");
     

       remb_id=urlValue[0].trim();
       lodge_date=urlValue[1].trim();
       emp_Id=urlValue[2].trim();
       
       
	console.log('remb_id',remb_id);
	//console.log('remb_id',remb_id.length);
	console.log('lodge_date',lodge_date);
	//console.log('lodge_date',lodge_date.length);
	console.log('User emp_Id',emp_Id);
   
	
	pdbconnect.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_remarks,hr_status,settlement_paid_flg  FROM reimbursement_master_tbl where remb_id =$1 and lodge_date=$2",[remb_id,lodge_date], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                
            	
			remburse_id=empResult.rows['0'].remb_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			project_id=empResult.rows['0'].project_id;
			hr_id =empResult.rows['0'].hr_id;
			repmgr_id =empResult.rows['0'].repmgr_id;
			amt_payable = empResult.rows['0'].amt_payable;
            advance_amt = empResult.rows['0'].advance_amt
			net_amt_payable =  empResult.rows['0'].net_amt_payable;
			user_remarks =  empResult.rows['0'].user_remarks;
			manager_remarks =  empResult.rows['0'].manager_remarks;
			hr_remarks =  empResult.rows['0'].hr_remarks;
			status =  empResult.rows['0'].status;
			lodge_date =  empResult.rows['0'].lodge_date;
      settlement_amount =empResult.rows['0'].settlement_amount;
      settlement_remarks=empResult.rows['0'].settlement_remarks;
      hr_status = empResult.rows['0'].hr_status;
      settlement_paid_flg =empResult.rows['0'].settlement_paid_flg; 
			console.log("remburse_id",remburse_id);
			
			

			
		}
       pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1", [repmgr_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            if(result2.rowCount!=0)
            {
             reporting_mgr=result2.rows['0'].emp_name;
            }
            console.log("reporting_mgr", reporting_mgr);

        }
        
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1", [hr_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
             hr_name=result2.rows['0'].emp_name;
            console.log("hr_name", hr_name);

        }
		
		pdbconnect.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1", [remb_id], function(err, billDataResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("billDataResult", billDataResult);
            var billData = billDataResult.rows;
            //billDataCount=billData.rowCount;
            // hr_name=result2.rows['0'].emp_name;
           //bill_image_upload=billDataResult.rows['0'].bill_image_upload;
           //image_filename  = billDataResult.rows['0'].image_filename;
           //image_filesize  = billDataResult.rows['0'].image_filesize
           //path= bill_image_upload.path;
           //stringDecoder.write(bill_image_upload)
           //console.log("jsonParse",jsonParse);
           //console.log("path",bill_image_upload);
           //console.log("image_filename",image_filename);
           //console.log("image_filesize",image_filesize);
           console.log("billData.rowCount",billDataResult.rowCount);
           console.log("billData.length", billData.length);

        }
     var billDocs=[];
     var billLen=0

             var targetDir = './data/CMS/bills/'+emp_id+"/";
             var finaltargetDir=targetDir+remburse_id+"/"
             if (!fs.existsSync(finaltargetDir))
            {
          // req.flash('error',"No records found")
            }
            else
           {
            fs.readdirSync(finaltargetDir).forEach(
           function (name) 
           {
          billDocs[billLen] = name;
          billLen = billLen + 1;
           });

           }

console.log("settlement_amount",settlement_amount);
console.log("settlement_amount",settlement_remarks);


  res.render('reimbursementModule/reimburseUserDetails',{
	
	rowData:rowData,
	billData:billData,
  billDocs:billDocs,
  billLen:billLen,
	emp_id:emp_id,
	empid:empid,
	emp_name:emp_name,
	empname:empname,
	remburse_id:remburse_id,
  project_id:project_id,
  hr_id:hr_id,
  hr_name:hr_name,
  hr_status:hr_status,
	reporting_mgr:reporting_mgr,
	emp_access:emp_access,
	repmgr_id:repmgr_id,
	amt_payable:amt_payable,
  net_amt_payable:net_amt_payable,
  advance_amt:advance_amt,
	user_remarks:user_remarks,
	manager_remarks:manager_remarks,
	hr_remarks:hr_remarks,
	status:status,
  settlement_amount:settlement_amount,
  //bill_image_upload:bill_image_upload,
  //image_filename:image_filename,
  //image_filesize:image_filesize,
	lodge_date:lodge_date,
  settlement_remarks:settlement_remarks,
	settlement_paid_flg:settlement_paid_flg
  
});
});
    });

    });
   });
}else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
  }

// router.post('/pdfDownload',pdfDownload);

// function pdfDownload(req,res) {
// var template = './views/reimbursementModule/reimburseUserDetails.ejs';
// var data = {
//     name: 'reimburseUserDetails.js'
// };
// var pdfPath = './pdf/file.pdf';
// var option = {
    
//         paperSize: {
//             format: 'A4',
//             orientation: 'portrait',
//             border: '1.8cm'
//         }
// };
//   pdfMaker(template, data, pdfPath, option);
//   // var file1 = pdfPath +file.pdf;
//   // fs.readFile(file1, 
//   // function(err, file) 
//   // {
    
      
//   //     res.writeHead(200, {"Content-Type" : "application/octet-stream", 
//   //       'Content-Disposition': 'attachment; filename='+file1});
//   //     res.write(file, "binary");
//   //     res.end();

//   // });
//   }
 
  router.get('/downloadBillsUpload',downloadBillsUpload);

  
  
  function downloadBillsUpload(req,res) {
       var id = req.query.id;
       console.log("id",id);
       var urlValues=id.split(":");
       var empId = urlValues['0'].trim();
       var remburse_id = urlValues['1'].trim();
       var fileName = urlValues['2'].trim();
       var exten = fileName.slice(-4);
       console.log("empId", empId);
       console.log("remburse_id", remburse_id);
       console.log("exten", exten);
       var targetDir = './data/CMS/bills/'+empId+"/";
       var finaltargetDir=targetDir+remburse_id+"/"
        console.log(finaltargetDir);
  var file1 = finaltargetDir +fileName;
  fs.readFile(file1, 
  function(err, file) 
  {
    //   var resValue = exten.search(".jpg");
    // if(resValue == -1)
    // {
    //   var resValue1 = exten.search(".pdf");
    //                     if(resValue1 == -1)
    //                     {
    //                             res.writeHead(200, {"Content-Type" : "application/pdf"});
    //                             res.write(file, "binary");
    //                             res.end();
    //                     }
    //                     else
    //                     {
    //                             res.setHeader('Content-disposition', 'attachment; filename=' + file1);
    //                             res.download(file1);
    //                     }
    // }
    // else
    // {
      
      res.writeHead(200, {"Content-Type" : "application/octet-stream", 
        'Content-Disposition': 'attachment; filename='+file1});
      res.write(file, "binary");
      res.end();
    //}
  });
}
	

router.get('/viewBillsUpload',viewBillsUpload);

  
  
  function viewBillsUpload(req,res) {
       var id = req.query.id;
       console.log("id",id);
       var urlValues=id.split(":");
       var empId = urlValues['0'].trim();
       var remburse_id = urlValues['1'].trim();
       var fileName = urlValues['2'].trim();
       var exten = fileName.slice(-4);
       console.log("empId", empId);
       console.log("remburse_id", remburse_id);
       console.log("exten", exten);
       var targetDir = './data/CMS/bills/'+empId+"/";
       var finaltargetDir=targetDir+remburse_id+"/"
        console.log(finaltargetDir);
  var file1 = finaltargetDir +fileName;
  fs.readFile(file1, 
  function(err, file) 
  {
      var resValue = exten.search(".jpg");
    if(resValue == -1)
     {
       var resValue1 = exten.search(".pdf");
       if(resValue1 == 0)
                   {
                               res.writeHead(200, {"Content-Type" : "application/pdf"});
                               res.write(file, "binary");
                               res.end();
                   }
                   else
                   {
           var resValue2 = exten.search(".png"); 
            if(resValue2 == 0)  
          {
             res.writeHead(200, {"Content-Type" : "image/png" });
                        res.write(file, "binary");
                        res.end();
            }  
           }       
                        
    }
   else
     {
      
      res.writeHead(200, {"Content-Type" : "image/jpg" });
                        res.write(file, "binary");
                        res.end();
    }
  });
}  
// function downloadUploadedImage(req,res) {
//   var id=req.query.id;
//   var urlValue = id.split(":");
//   var bill_id = urlValue['0'].trim();
//   var remburse_id = urlValue['1'].trim();
//   console.log("bill_id", bill_id);
//   console.log("remburse_id", remburse_id);
//   pdbconnect.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks,bill_image_upload,image_filename,image_filesize from reimbursement_details_tbl where bill_id =$1 and remb_id=$2", [bill_id,remburse_id], function(err, billDataResult) {
//         if (err) {
//             console.error('Error with table query', err);
//         } else {
//             console.log("billDataResult", billDataResult);
//             var billData = billDataResult.rows;
//             //billDataCount=billData.rowCount;
//             // hr_name=result2.rows['0'].emp_name;
//            bill_image_upload=billDataResult.rows['0'].bill_image_upload;
//            image_filename  = billDataResult.rows['0'].image_filename;
//            image_filesize  = billDataResult.rows['0'].image_filesize
//            path= bill_image_upload.path;
//            //stringDecoder.write(bill_image_upload)
//            //console.log("jsonParse",jsonParse);
//            console.log("path",bill_image_upload);
//            console.log("image_filename",image_filename);
//            console.log("image_filesize",image_filesize);
//            console.log("billData.rowCount",billData.rowCount);
//            console.log("billData.length", billData.length);
//         buffer=bill_image_upload;
//     //   var file = fileUpload;
//     //  var path = file.path;
//     // var fsiz = file.size;
//      var buffer = new Buffer(image_filesize);

//     // // fs.open(path, 'r', function(err, fd) {

//     //     fs.read(fd, buffer, 0, image_filesize, 0, function (err, bytesRead, buffer) {
//     //         console.log(err);
//     //         console.log(bytesRead);
//     //         console.log(buffer);
//     //     });

//     // // });
//     // var buffer = Buffer.from(bill_image_upload)
// // var data = Array.prototype.slice.call(bill_image_upload, 0);

// // console.log("data::::::::::",data);
// //    var myBuffer = new Buffer(image_filesize);
// //  for (var i = 0; i < image_filesize; i++) {
// //       myBuffer[i] = data[i];
// //   }
// //   fs.writeFile('nandhu.jpeg', myBuffer, function(err) {
// //       if(err) {
// //           console.log(err);
// //       } else {
// //           console.log("The file was saved!");
// //       }
// //   });
     

//     var exten = image_filename.slice(-4);
//     var repfmt = exten;

//    var data = buffer;


//  res.writeHead(200, {
//        'Content-Type': 'application/octet-stream'+repfmt,
//        'Content-Disposition': 'attachment; filename='+image_filename,
//        'Content-Length': data.length
//      });
//        res.end(data);
//         }

 
     
     
//     });
// }


module.exports = router;
