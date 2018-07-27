node('master') {
    ansiColor('xterm') {
        def image

        stage('Checkout') {
            checkout scm
            GIT_COMMIT_HASH = sh (
                script: 'git rev-parse HEAD',
                returnStdout: true
            ).trim()
        }
        stage('Build') {
            image = docker.build("scos/cota-streaming-ui:${GIT_COMMIT_HASH}")
        }
        stage('Publish') {
            docker.withRegistry("https://199837183662.dkr.ecr.us-east-2.amazonaws.com", "ecr:us-east-2:aws_jenkins_user") {
                image.push()
                image.push('latest')
            }
        }
        stage('Deploy to Dev') {
            build job: 'deploy-cota-streaming-ui', parameters: [credentials(name: 'kubernetesCreds', value: 'kubeconfig-dev'), text(name: 'tag', value: "${GIT_COMMIT_HASH}")]
        }
    }
}
