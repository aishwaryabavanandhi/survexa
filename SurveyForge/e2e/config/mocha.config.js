module.exports = {
    timeout: 60000,
    reporter: 'mochawesome',
    'reporter-option': [
        'reportDir=reports/html',
        'reportFilename=e2e-report',
        'quiet=true',
        'overwrite=false',
        'html=true',
        'json=true'
    ]
};
