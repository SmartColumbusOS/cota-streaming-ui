def uiImage
def scmVars

node('master') {
    ansiColor('xterm') {
        stage('Checkout') {
            scmVars = checkout scm
            GIT_COMMIT_HASH = sh (
                script: 'git rev-parse HEAD',
                returnStdout: true
            ).trim()
        }

        stage('Build') {
            uiImage = docker.build("scos/cota-streaming-ui:${GIT_COMMIT_HASH}")
        }

        if (scmVars.GIT_BRANCH == 'master') {
                stage('Publish') {
                    docker.withRegistry("https://199837183662.dkr.ecr.us-east-2.amazonaws.com", "ecr:us-east-2:aws_jenkins_user") {
                        uiImage.push()
                        uiImage.push('latest')
                    }
                }

            def environment = 'dev'
            stage('Deploy to Dev') {
                sh("sed -i 's/%VERSION%/${GIT_COMMIT_HASH}/' k8s/deployment/1-deployment.yaml")
                kubernetesDeploy(kubeconfigId: "kubeconfig-${environment}",
                        configs: "k8s/configs/${environment}.yaml,k8s/deployment/*",
                        secretName: 'regcred',
                        dockerCredentials: [
                            [credentialsId: 'ecr:us-east-2:aws_jenkins_user', url: 'https://199837183662.dkr.ecr.us-east-2.amazonaws.com'],
                        ]
                )
            }

            stage('Run Smoke Tester') {
                dir('smoke-test') {
                    def smoker = docker.build("cota-smoke-test")
                    timeout(time: 2, unit: 'MINUTES') {
                        smoker.withRun("-e ENDPOINT_URL=cota.${environment}.smartcolumbusos.com") { container ->
                            sh "docker logs -f ${container.id}"
                            sh "exit \$(docker inspect ${container.id} --format='{{.State.ExitCode}}')"
                        }
                    }
                }
            }
        }
    }
}
